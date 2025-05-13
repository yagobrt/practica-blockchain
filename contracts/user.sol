// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UsuariosP2P {
    struct Usuario {
        address direccion; // User's Ethereum address
        bytes32[] prestamosActivos; // Active loan IDs
        bytes32[] prestamosPasados; // Finished loan IDs
        bool registrado; // To check if user exists
    }

    mapping(address => Usuario) public usuarios;

    // Evento al registrar usuario
    event UsuarioRegistrado(address usuario);
    // Evento cuando se añade un préstamo
    event PrestamoAnadido(address usuario, bytes32 prestamoId); //Prestamos Añadido
    // Evento cuando se marca un préstamo como finalizado
    event PrestamoFinalizado(address usuario, bytes32 prestamoId);

    // Registrar al usuario si no existe
    function registrarUsuario() public {
        require(!usuarios[msg.sender].registrado, "Ya estas registrado");
        usuarios[msg.sender].direccion = msg.sender;
        usuarios[msg.sender].registrado = true;
        emit UsuarioRegistrado(msg.sender);
    }

    // Añadir un préstamo a su lista activa
    function añadirPrestamoActivo(address usuario, bytes32 prestamoId) public {
        require(usuarios[usuario].registrado, "Usuario no registrado");
        usuarios[usuario].prestamosActivos.push(prestamoId);
        emit PrestamoAnadido(usuario, prestamoId);
    }

    // Mover préstamo de activo a pasado
    function finalizarPrestamo(address usuario, bytes32 prestamoId) public {
        require(usuarios[usuario].registrado, "Usuario no registrado");
        bool encontrado = false;
        uint256 index;

        for (uint i = 0; i < usuarios[usuario].prestamosActivos.length; i++) {
            if (usuarios[usuario].prestamosActivos[i] == prestamoId) {
                encontrado = true;
                index = i;
                break;
            }
        }

        require(encontrado, "Prestamo no encontrado en activos");

        // Mover a pasados
        usuarios[usuario].prestamosPasados.push(prestamoId);

        // Eliminar de activos
        usuarios[usuario].prestamosActivos[index] = usuarios[usuario].prestamosActivos[usuarios[usuario].prestamosActivos.length - 1];
        usuarios[usuario].prestamosActivos.pop(); //Elimina primero árbol

        emit PrestamoFinalizado(usuario, prestamoId);
    }

    // Devolver préstamos activos
    function verPrestamosActivos(address usuario) public view returns (bytes32[] memory) {
        return usuarios[usuario].prestamosActivos;
    }

    // Devolver historial (préstamos pasados)
    function verHistorial(address usuario) public view returns (bytes32[] memory) {
        return usuarios[usuario].prestamosPasados;
    }

    // Validar identidad (simulada)
    function validarIdentidad(address usuario) public view returns (bool) {
        return usuarios[usuario].registrado;
    }
}