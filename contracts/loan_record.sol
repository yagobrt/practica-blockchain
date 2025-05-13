// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for interacting with ERC20 tokens
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract RegistroLoan {
    // This struct stores basic loan request data
    struct SolicitudPrestamo {
        address prestamista;
        address prestatario;
        address token;
        uint256 cantidad;
        uint256 interes;
        bool aprobado_por_prestamista;
        bool aprobado_por_prestatario;
        bool prestamo_desplegado;
    }

    // Mapping of loan requests by ID
    mapping(bytes32 => SolicitudPrestamo) public solicitudes;

    // Mapping of user to their loan IDs
    mapping(address => bytes32[]) public prestamos_por_usuario;

    // Events for tracking actions
    event PrestamoCreado(bytes32 id, address prestamista, address prestatario, uint256 cantidad, uint256 interes);
    event PrestamoAprobado(bytes32 id, address quien);
    event PrestamoDesplegado(bytes32 id);

    // Create a new loan request
    function crear_prestamo(bytes32 id, address _prestatario, address _token, uint256 _cantidad, uint256 _interes) public {
        require(solicitudes[id].prestamista == address(0), "Este ID ya existe");
        require(_prestatario != address(0), "Direccion del prestatario no valida");
        require(_cantidad > 0, "La cantidad debe ser mayor a 0");
        require(_interes <= 100, "Interes maximo permitido es 100%");

        solicitudes[id] = SolicitudPrestamo(
            msg.sender,         // prestamista
            _prestatario,       // prestatario
            _token,             // token usado
            _cantidad,          // cantidad prestada
            _interes,           // interes porcentual
            false,              // no aprobado aun por prestamista
            false,              // no aprobado aun por prestatario
            false               // no desplegado aun
        );

        // Store the ID for both users
        prestamos_por_usuario[msg.sender].push(id);
        prestamos_por_usuario[_prestatario].push(id);

        emit PrestamoCreado(id, msg.sender, _prestatario, _cantidad, _interes);
    }

    // Each party must approve the loan before it's final
    function aprobar_prestamo(bytes32 id) public {
        SolicitudPrestamo storage p = solicitudes[id];
        require(!p.prestamo_desplegado, "El prestamo ya fue desplegado");

        if (msg.sender == p.prestamista) {
            p.aprobado_por_prestamista = true;
        } else if (msg.sender == p.prestatario) {
            p.aprobado_por_prestatario = true;
        } else {
            revert("No tienes permiso para aprobar este prestamo");
        }

        emit PrestamoAprobado(id, msg.sender);

        if (p.aprobado_por_prestamista && p.aprobado_por_prestatario) {
            p.prestamo_desplegado = true;
            emit PrestamoDesplegado(id);
        }
    }

    // View all loan IDs for a user
    function ver_prestamos_usuario(address usuario) public view returns (bytes32[] memory) {
        return prestamos_por_usuario[usuario];
    }

    // View loan details
    function ver_prestamo(bytes32 id) public view returns (
        address prestamista,
        address prestatario,
        address token,
        uint256 cantidad,
        uint256 interes,
        bool aprobado_prestamista,
        bool aprobado_prestatario,
        bool desplegado
    ) {
        SolicitudPrestamo memory p = solicitudes[id];
        return (
            p.prestamista,
            p.prestatario,
            p.token,
            p.cantidad,
            p.interes,
            p.aprobado_por_prestamista,
            p.aprobado_por_prestatario,
            p.prestamo_desplegado
        );
    }
}
