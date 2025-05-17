// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

interface IUsuariosP2P {
    function validarIdentidad(address usuario) external view returns (bool);
    function añadirPrestamoActivo(address usuario, bytes32 prestamoId) external;
    function finalizarPrestamo(address usuario, bytes32 prestamoId) external;
}

interface IRegistroLoan {
    function ver_prestamo(bytes32 id) external view returns (
        address, address, address, uint256, uint256, bool, bool, bool
    );
}

contract P2PBank {
    struct Prestamo {
        address prestamista;
        address prestatario;
        address token;
        uint256 cantidad;
        uint256 interes;
        uint256 total_pagar;
        uint256 pagado;
        bool dinero_enviado;
        bool todo_pagado;
    }

    mapping(bytes32 => Prestamo) public prestamos;
    mapping(bytes32 => uint256[]) public fechas_de_pago;

    event PrestamoEjecutado(bytes32 id);
    event PagoRealizado(bytes32 id, uint256 cantidad);

    address public admin;
    IUsuariosP2P public usuariosContract;
    IRegistroLoan public registroContract;

    bool private locked;
    modifier noReentrancy() {
        require(!locked, "Reentrada detectada");
        locked = true;
        _;
        locked = false;
    }

    modifier soloAdmin() {
        require(msg.sender == admin, "Solo admin");
        _;
    }

    constructor(address _usuarios, address _registro) {
        admin = msg.sender;
        usuariosContract = IUsuariosP2P(_usuarios);
        registroContract = IRegistroLoan(_registro);
    }

    function setUsuariosContract(address _usuarios) external soloAdmin {
        usuariosContract = IUsuariosP2P(_usuarios);
    }

    function setRegistroContract(address _registro) external soloAdmin {
        registroContract = IRegistroLoan(_registro);
    }

    function ejecutarPrestamo(bytes32 id) public noReentrancy {
        (
            address prestamista,
            address prestatario,
            address token,
            uint256 cantidad,
            uint256 interes,
            bool aprobado_prestamista,
            bool aprobado_prestatario,
            bool desplegado
        ) = registroContract.ver_prestamo(id);

        require(prestamista != address(0) && prestatario != address(0), "Prestamo no encontrado");
        require(aprobado_prestamista && aprobado_prestatario && desplegado, "Falta aprobacion");
        require(usuariosContract.validarIdentidad(prestamista), "Identidad prestamista invalida");
        require(usuariosContract.validarIdentidad(prestatario), "Identidad prestatario invalida");
        require(prestamos[id].prestamista == address(0), "Prestamo ya ejecutado");

        uint256 total = cantidad + (cantidad * interes / 100);

        prestamos[id] = Prestamo({
            prestamista: prestamista,
            prestatario: prestatario,
            token: token,
            cantidad: cantidad,
            interes: interes,
            total_pagar: total,
            pagado: 0,
            dinero_enviado: true,
            todo_pagado: false
        });

        // Transferencia del prestamista al prestatario
        try IERC20(token).transferFrom(prestamista, prestatario, cantidad) returns (bool success) {
            require(success, "Transferencia fallida");
        } catch {
            revert("Error en transferencia de fondos");
        }

        // Registrar préstamo activo en ambos usuarios
        usuariosContract.añadirPrestamoActivo(prestamista, id);
        usuariosContract.añadirPrestamoActivo(prestatario, id);

        emit PrestamoEjecutado(id);
    }

    function pagar_prestamo(bytes32 id, uint256 cantidad) public noReentrancy {
        Prestamo storage p = prestamos[id];
        require(msg.sender == p.prestatario, "No autorizado");
        require(p.dinero_enviado, "Prestamo no ejecutado");
        require(!p.todo_pagado, "Prestamo ya pagado");

        uint256 restante = p.total_pagar - p.pagado;
        require(cantidad <= restante, "Pago excede lo debido");
        require(cantidad > 0, "Cantidad invalida");

        p.pagado += cantidad;
        if (p.pagado >= p.total_pagar) {
            p.todo_pagado = true;

            // Marcar como finalizado para ambos
            usuariosContract.finalizarPrestamo(p.prestatario, id);
            usuariosContract.finalizarPrestamo(p.prestamista, id);
        }

        try IERC20(p.token).transferFrom(msg.sender, p.prestamista, cantidad) returns (bool success) {
            require(success, "Transferencia de pago fallida");
        } catch {
            revert("Error en la transferencia de pago");
        }

        emit PagoRealizado(id, cantidad);
    }

    // Ver fechas de pago
    function poner_fechas_pago(bytes32 id, uint256 inicio, uint256 intervalo, uint8 cantidad) public {
        require(prestamos[id].prestamista == msg.sender, "Solo prestamista puede definir fechas");
        require(fechas_de_pago[id].length == 0, "Fechas ya definidas");

        for (uint8 i = 0; i < cantidad; i++) {
            fechas_de_pago[id].push(inicio + (intervalo * 1 days * i));
        }
    }

    function pagos_vencidos(bytes32 id) public view returns (uint8) {
        uint8 vencidos = 0;
        for (uint8 i = 0; i < fechas_de_pago[id].length; i++) {
            if (block.timestamp >= fechas_de_pago[id][i]) {
                vencidos++;
            }
        }
        return vencidos;
    }

    function cuanto_falta(bytes32 id) public view returns (uint256) {
        Prestamo memory p = prestamos[id];
        return (p.total_pagar > p.pagado) ? (p.total_pagar - p.pagado) : 0;
    }
}
