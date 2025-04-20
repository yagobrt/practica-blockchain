const { signMessage } = require('./services/signMessage')

const mensaje = '¡Hola, somos P2P Bank!\nY esto funciona 😁';
const firmaHex = signMessage(mensaje);

console.log('Mensaje:', mensaje);
console.log('Firma (hex):', firmaHex);
