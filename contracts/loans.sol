// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*

  EscrowLoan.sol

  ----------------------------------------------------------------------------
  Este contrato permite:
   1) Que un prestamista deposite (lock) un principal ERC‑20 para un préstamo.
   2) Registrar un calendario de pagos (listas de timestamps).
   3) Hacer que el prestatario repague, en cada fecha pactada, la cantidad proporcional 
      al saldo restante dividido por las fechas que queden.
   4) Una vez se liquida por completo, el contrato marca el préstamo como cerrado.
   5) Usa:
      - OpenZeppelin Ownable (propietario/admin)
      - OpenZeppelin ReentrancyGuard (anti-reentrancy)
      - OpenZeppelin SafeERC20 (manejo seguro de tokens ERC‑20)
  ----------------------------------------------------------------------------
*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract P2PBank is Ownable(msg.sender), ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ------------------------
    // ESTRUCTURAS Y ESTADO
    // ------------------------

    struct Prestamo {
        address prestamista;           // Prestamista
        address prestatario;         // Prestatario
        IERC20  token;            // Token ERC‑20 usado para préstamo
        uint256 cantidad;        // Monto original
        uint256 interes;      // Interés en basis points (p.ej. 500 = 5.00 %)
        uint256 total_pagar;     // Principal + interés (calculado en createLoan)
        uint256 pagado;           // Cuánto ha pagado ya el prestatario
        bool    dinero_enviado;           // True si el prestamista ya depositó el principal
        bool    todo_pagado;      // True si se pagó todo
        uint256[] fechas_de_pago;       // Lista de timestamps (UNIX) pactados para cuotas
        uint256 proxima_fecha;        // Índice de la siguiente cuota pendiente (0..schedule.length‑1)
    }

    /// @dev Mapping de ID (bytes32) → Loan completo
    mapping(bytes32 => Prestamo) public prestamos;

    /// @dev Evento al crear un nuevo préstamo
    event PrestamoCreado(
        bytes32 indexed id,
        address indexed prestamista,
        address indexed prestatario,
        address token,
        uint256 cantidad,
        uint256 interes,
        uint256 total_pagar,
        uint256[] fechas_de_pago
    );

    /// @dev Evento cuando el prestamista deposita el principal
    event PrestamoPagoInicial(bytes32 indexed id);

    /// @dev Evento cuando el prestatario paga una cuota
    event PrestamoPagado(
        bytes32 indexed id,
        address indexed prestatario,
        uint256 cantidad_pagada,
        uint256 restante,
        uint256 siguiente_fecha
    );

    /// @dev Evento cuando el préstamo se liquida por completo
    event PrestamoPagadoCompleto(bytes32 indexed id);

    // ------------------------
    // FUNCIONES PRINCIPALES
    // ------------------------

    /**
     * @notice Crea un préstamo “on‑chain” bloqueando el ID y toda la info básica.
     * @param id             Identificador único para este préstamo (por ejemplo: keccak256(abi.encodePacked(lender, borrower, block.timestamp))).
     * @param prestatario    Dirección Ethereum del prestatario.
     * @param token          Dirección del token ERC‑20 usado (p. ej. DAI, WETH).
     * @param cantidad       Monto a prestar (en unidades del token, sin decimales añadidos).
     * @param interes        Interés en basis points (p.ej. 500 = 5.00 %). Debe ser ≤ 10000 (100 %).
     * @param fechas_de_pago Array de timestamps UNIX ordenados de forma estrictamente ascendente (>= block.timestamp).
     *
     * Requisitos:
     *  - Solo el prestamista puede llamar a esta función, pero en esta versión no forzamos modifier; el propio prestamista firma off‑chain.
     *  - id debe no existir aún (mapeo prestamos[id].prestamista == address(0)).
     *  - prestatario ≠ address(0).
     *  - cantidad > 0.
     *  - interes ≤ 10000.
     *  - fechas_de_pago.length ≥ 1. Cada timestamp debe ser >= block.timestamp, y la secuencia debe ser estrictamente creciente.
     *
     * Al llamar:
     *   1) Se calcula total_pagar = cantidad + (cantidad * interes / 10000).
     *   2) Se guarda el Prestamo en prestamos[id], con dinero_enviado=false, pagado=0, todo_pagado=false, proxima_fecha=0.
     *   3) Emite PrestamoCreado.
     *
     * La transferencia del principal (transferFrom) **NO** ocurre aquí, sino en `fundLoan(...)` tras approve.
     */
    function crear_prestamo(
        bytes32 id,
        address prestatario,
        address token,
        uint256 cantidad,
        uint256 interes,
        uint256[] memory fechas_de_pago
    ) external nonReentrant {
        // 1) id único
        require(prestamos[id].prestamista == address(0), "ID ya existe");
        // 2) datos básicos válidos
        require(prestatario != address(0), "Prestatario invalido");
        require(cantidad > 0, "Principal debe ser > 0");
        require(interes <= 10000, "Interes maximo 100%");
        require(fechas_de_pago.length > 0, "Cronograma vacio");

        // 3) validar que cada fecha sea futura y orden ascendente
        uint256 len = fechas_de_pago.length;
        uint256 prev = 0;
        for (uint256 i = 0; i < len; i++) {
            uint256 ts = fechas_de_pago[i];
            require(ts >= block.timestamp, "Fecha < ahora");
            if (i > 0) {
                require(ts > prev, "Fechas no ascendentes");
            }
            prev = ts;
        }

        // 4) Calcular total a pagar: principal + (principal * interestBps / 10000)
        uint256 total = cantidad + (cantidad * interes) / 10000;

        // 5) Guardar la estructura Loan
        Prestamo storage ln = prestamos[id];
        ln.prestamista       = msg.sender;
        ln.prestatario     = prestatario;
        ln.token        = IERC20(token);
        ln.cantidad    = cantidad;
        ln.interes  = interes;
        ln.total_pagar = total;
        ln.pagado       = 0;
        ln.dinero_enviado       = false;
        ln.todo_pagado  = false;
        ln.fechas_de_pago     = fechas_de_pago;
        ln.proxima_fecha    = 0;

        emit PrestamoCreado(
            id,
            msg.sender,
            prestatario,
            token,
            cantidad,
            interes,
            total,
            fechas_de_pago
        );
    }

    /**
     * @notice El prestamista debe haber hecho antes: token.approve(this, principal).
     *         Con este paso, el contrato transfiere realmente el principal desde el prestamista al prestatario.
     * @param id  ID del préstamo previamente creado.
     *
     * Requisitos:
     *  - Solo el lender (lo que guardamos en loans[id].lender) puede llamar.
     *  - funded == false.
     *
     * Acciones:
     *  1) Ejecuta `token.transferFrom(prestamista, prestatario, cantidad)`.
     *  2) Marca `dinero_enviado = true`.
     *  3) Emite PrestamoPagoInicial(id).
     */
    function ejecutar_prestamo(bytes32 id) external nonReentrant {
        Prestamo storage p = prestamos[id];
        require(p.prestamista != address(0), "Prestamo no existe");
        require(msg.sender == p.prestamista, "Solo lender");
        require(!p.dinero_enviado, "Ya fue financiado");

        // transferFrom(lender → borrower, principal)
        p.token.safeTransferFrom(p.prestamista, p.prestatario, p.cantidad);
        p.dinero_enviado = true;

        emit PrestamoPagoInicial(id);
    }

    /**
     * @notice El prestatario paga la cuota correspondiente a la fecha actual (o anterior). 
     *         El contrato calcula cuánto se debe en esta cuota como:
     *            montoPorCuota = (saldoRestante) / (fechasTotales - índicesPagados).
     *         o sea, si quedan N fechas y debe R, cada fecha es R/N.
     *
     * @param id       ID del préstamo.
     * @param cantidad Monto que el prestatario quiere pagar (debe ser exactamente la cuota esperada).
     *
     * Requisitos:
     *  - prestamos[id].dinero_enviado == true (el préstamo ya fue financiado).
     *  - prestamos[id].todo_pagado == false.
     *  - msg.sender == prestamos[id].prestatario.
     *  - proxima_fecha < fechas_de_pago.length (aún quedan cuotas pendientes).
     *  - block.timestamp >= fechas_de_pago[proxima_fecha] (fecha de vencimiento).
     *  - cantidad == cuotaExacta (para evitar pagos parciales inválidos).
     *
     * Acciones:
     *  1) Transfiere `cantidad` tokens desde prestatario → prestamista (requiere `approve` previo).
     *  2) Actualiza `p.pagado += cantidad`.
     *  3) Incrementa `p.proxima_fecha += 1`.
     *  4) Si proxima_fecha == fechas_de_pago.length, marca `todo_pagado = true` y emite PrestamoPagadoCompleto(id).
     *  5) Emite PrestamoPagado(id, prestatario, cantidad, restante, siguiente_fecha).
     */
    function pagar_prestamo(bytes32 id, uint256 cantidad) external nonReentrant {
        Prestamo storage p = prestamos[id];
        require(p.prestamista != address(0), "Prestamo no existe");
        require(p.dinero_enviado, "No financiado aun");
        require(!p.todo_pagado, "Ya liquidado");
        require(msg.sender == p.prestatario, "Solo borrower");
        
        uint256 idx = p.proxima_fecha;
        require(idx < p.fechas_de_pago.length, "Todas fechas usadas");
        require(block.timestamp >= p.fechas_de_pago[idx], "Fecha de pago no vencida");

        // Calcular saldo y cuota
        uint256 saldoRestante = p.total_pagar - p.pagado;
        uint256 cuotasRestantes = p.fechas_de_pago.length - idx;
        // montoPorCuota = saldoRestante / cuotasRestantes  (division entera)
        uint256 montoPorCuota = saldoRestante / cuotasRestantes;
        require(montoPorCuota > 0, "Cuota invalida");
        require(cantidad == montoPorCuota, "Paga cuota exacta");

        // Transferir pago al lender
        p.token.safeTransferFrom(p.prestatario, p.prestamista, montoPorCuota);

        // Actualizar estados
        p.pagado    += montoPorCuota;
        p.proxima_fecha += 1;

        // Emitir evento de pago
        uint256 restanteDespues = p.total_pagar - p.pagado;
        uint256 nextDue = (p.proxima_fecha < p.fechas_de_pago.length)
            ? p.fechas_de_pago[p.proxima_fecha]
            : 0;

        emit PrestamoPagado(id, msg.sender, montoPorCuota, restanteDespues, nextDue);

        // Si se pagó todo
        if (p.proxima_fecha == p.fechas_de_pago.length) {
            p.todo_pagado = true;
            emit PrestamoPagadoCompleto(id);
        }
    }

    // --------------------------
    // FUNCIONES DE CONSULTA
    // --------------------------

    /// @notice Devuelve información del préstamo concreto (sin exponer internal schedule).
    function getLoanInfo(bytes32 id) external view returns (
        address prestamista,
        address prestatario,
        address token,
        uint256 cantidad,
        uint256 interes,
        uint256 total_pagar,
        uint256 pagado,
        bool dinero_enviado,
        bool todo_pagado,
        uint256 proxima_fecha
    ) {
        Prestamo storage p = prestamos[id];
        prestamista         = p.prestamista;
        prestatario       = p.prestatario;
        token          = address(p.token);
        cantidad      = p.cantidad;
        interes    = p.interes;
        total_pagar   = p.total_pagar;
        pagado         = p.pagado;
        dinero_enviado         = p.dinero_enviado;
        todo_pagado    = p.todo_pagado;
        proxima_fecha = (p.proxima_fecha < p.fechas_de_pago.length)
            ? p.fechas_de_pago[p.proxima_fecha]
            : 0;
    }

    /// @notice Devuelve todas las fechas pactadas (timestamps) para el préstamo.
    function ver_fechas_pago(bytes32 id) external view returns (uint256[] memory) {
        return prestamos[id].fechas_de_pago;
    }

    /// @notice Devuelve cuántas cuotas ya vencieron (block.timestamp >= fecha).
    function pagos_vencidos(bytes32 id) external view returns (uint256) {
        Prestamo storage p = prestamos[id];
        uint256 vencidos = 0;
        uint256 len = p.fechas_de_pago.length;
        for (uint256 i = 0; i < len; i++) {
            if (block.timestamp >= p.fechas_de_pago[i]) {
                vencidos++;
            }
        }
        return vencidos;
    }

    /// @notice Devuelve cuánto falta por pagar (total_pagar ‑ pagado).
    function cuanto_falta(bytes32 id) external view returns (uint256) {
        Prestamo storage p = prestamos[id];
        return (p.total_pagar > p.pagado)
            ? (p.total_pagar - p.pagado)
            : 0;
    }

    // --------------------------
    // FUNCIONES ADMIN (soloOwner)
    // --------------------------

    /// @notice Permite al owner (admin) retirar tokens sobrantes que puedan quedar en el contrato.
    function rescueTokens(address tokenAddress) external onlyOwner {
        IERC20 tk = IERC20(tokenAddress);
        uint256 bal = tk.balanceOf(address(this));
        require(bal > 0, "Sin saldo para rescatar");
        tk.safeTransfer(owner(), bal);
    }
}
