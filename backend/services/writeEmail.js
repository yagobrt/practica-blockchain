require('dotenv').config();
const { templates } = require('./emailTemplates');
const { EmailType } = require('./emailTypes');
const { signMessage } = require('./signMessage');

/**
 * Genera un mensaje de email y su firma
 *
 * @param {EmailType} type Tipo de email a generar
 * @param {Object} data Datos requeridos para el email (usuario, links, otp...)
 * @returns {{message: string, signature: string}}
 * El mensaje a enviar y su firma en hexadecimal
 * @throws Si el tipo de email no existe lanza un error
 */
function generateSignedEmail(type, data) {
	if (!templates[type]) {
		throw new Error(`Tipo de email no reconocido: ${type}`);
	}

	// Crear el mensaje y firmarlo
	const message = templates[type](data);
	const signature = signMessage(message);

	return { message, signature }
}

module.exports = { generateSignedEmail };
