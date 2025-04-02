// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Prestamo tiene:
// Parametros
// - cantidad inicial
// - cantidad pagada
// - interes
// - periodos (lista de fechas)
// - prestatario (recibir fondos)
// - prestamista (dar fondos)
// metodos
// - 1er constructor, inicia prestamo con un monto y el interes
// - getters de cantidad, interes, cuentas ...
// - pagar la "mensualidad" 
// - ver cuanto te queda por pagar
// - liquidar