// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for interacting with ERC20 tokens
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

contract P2PBank {
    // This struct saves the loan data
    struct Prestamo {
        address prestamista; // Lender
        address prestatario; // Borrower
        address token; // Token used
        uint256 cantidad; // Principal
        uint256 interes; // Interest (max 100%)
        uint256 total_pagar; // Total repayment
        uint256 pagado; // How much is already paid
        bool aprobado_por_prestamista; //Approved by lender
        bool aprobado_por_prestatario; //Approved by borrower
        bool dinero_enviado; //Money sent
        bool todo_pagado; //All paid
    }

    // All loans are saved in this mapping
    mapping(bytes32 => Prestamo) public prestamos;

    // Each loan has a list of due dates
    mapping(bytes32 => uint256[]) public fechas_de_pago; ////////--------REVISAR SI FUNCIONA--------////////////////////////

    // Events for tracking things
    event PrestamoCreado(bytes32 id, address prestamista, address prestatario, uint256 cantidad);
    event PrestamoAprobado(bytes32 id, address quien);
    event PagoRealizado(bytes32 id, uint256 cantidad);

    // Create a new loan
    function crearPrestamo(bytes32 id, address _prestatario, address _token, uint256 _cantidad, uint256 _interes) public {
        require(prestamos[id].prestamista == address(0), "Ese prestamo ya existe"); //Loan (ID) already exists
        require(_interes <= 100, "Interes maximo es 100%"); //"Interest must be <= 100%"

        uint256 total = _cantidad + (_cantidad * _interes / 100);

        prestamos[id] = Prestamo(
            msg.sender, //lender
            _prestatario, //borrower
            _token, //token
            _cantidad, //principal
            _interes, //interest
            total, //totalRepayable
            0, //amountrepaid
            //startDate ¿? <--------- Preguntar YAGO
            //dueDates ¿? <--------- PReguntar YAGO
            false, //lenderApproved
            false,  //borrowerApproved
            false, //disbursed
            false//repaid
        );
        emit PrestamoCreado(id, msg.sender, _prestatario, _cantidad);
    }

    // Approve the loan (both must do it, borrower and lender)
    function aprobar_prestamo(bytes32 id) public {
        Prestamo storage p = prestamos[id];
        require(!p.dinero_enviado, "El dinero ya fue enviado"); //Loan already sent

        if (msg.sender == p.prestamista) {
            p.aprobado_por_prestamista = true;
        }

        if (msg.sender == p.prestatario) {
            p.aprobado_por_prestatario = true;
        }

        emit PrestamoAprobado(id, msg.sender);

        // If both approved, send tokens to borrower
        if (p.aprobado_por_prestamista && p.aprobado_por_prestatario) {
            p.dinero_enviado = true;
            IERC20(p.token).transferFrom(p.prestamista, p.prestatario, p.cantidad);
        }
    }

    // Borrower can pay in parts
    function pagar_prestamo(bytes32 id, uint256 cantidad) public {
        Prestamo storage p = prestamos[id];
        require(msg.sender == p.prestatario, "Solo el prestatario puede pagar"); //Only borrower can repay
        require(p.dinero_enviado, "El dinero no ha sido enviado"); //Loan not disbursed yet
        require(!p.todo_pagado, "Ya esta todo pagado"); //Loan already pay

        IERC20(p.token).transferFrom(msg.sender, p.prestamista, cantidad);
        p.pagado += cantidad;

        if (p.pagado >= p.total_pagar) {
            p.todo_pagado = true;
        }

        emit PagoRealizado(id, cantidad);
    }

    // Return how much is left to pay
    function cuanto_falta(bytes32 id) public view returns (uint256) {
        Prestamo memory p = prestamos[id];
        if (p.total_pagar <= p.pagado) {
            return 0;
        } else {
            return p.total_pagar - p.pagado;
        }
    }

    // Save a list of payment dates (set once)
    function poner_fechas_pago(bytes32 id, uint256 fecha_inicio, uint256 dias_intervalo, uint8 numero_pagos) public {
        require(prestamos[id].prestamista == msg.sender, "Solo el prestamista puede poner fechas"); // Only borrower can put dates
        require(fechas_de_pago[id].length == 0, "Fechas ya existen"); //Dates already exist

        for (uint8 i = 0; i < numero_pagos; i++) {
            fechas_de_pago[id].push(fecha_inicio + (dias_intervalo * 1 days * i));
        }
    }

    // Return how many payments should have been made by now
    function pagos_vencidos(bytes32 id) public view returns (uint8) {
        uint8 vencidos = 0;
        for (uint8 i = 0; i < fechas_de_pago[id].length; i++) {
            if (block.timestamp >= fechas_de_pago[id][i]) {
                vencidos++;
            }
        }
        return vencidos;
    }

    // Get all payment dates
    function ver_fechas_pagos(bytes32 id) public view returns (uint256[] memory) {
        return fechas_de_pago[id];
    }
}
