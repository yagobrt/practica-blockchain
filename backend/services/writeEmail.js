require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

/**
 * Guarda el email y le da un formato adecuado
 * 
 * @param {string} username nombre del usuario
 * @param {string} emailAddress dirección de correo
 * @param {string} subject Título del correo electrónico
 * @param {string} message Contenido del correo
 * @param {string} signature Firma del mensaje usando nuestra clave privada
 * @returns {string} Nombre del archivo donde se ha guardado, dentro de la carpeta emails/
 */
function saveEmail(username, emailAddress, subject, message, signature) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `email-${username}-${timestamp}.txt`;
	const filepath = path.resolve(__dirname, '../emails', filename); // crea una carpeta "emails"

	const emailContent = `From: \"P2P BANK\" <noreply@p2p.bank>
To: \"${username}\" <${emailAddress}>
Subject: ${subject}
---  INICIO DEL EMAIL  ---
${message}
---    FIN DEl EMAIL   ---

--- INICIO DE LA FIRMA ---
${signature}
---   FIN DE LA FIRMA  ---
`;

	// Asegura que el directorio exista
	fs.mkdir(path.dirname(filepath), { recursive: true }, (dirErr) => {
		if (dirErr) {
			console.error('Error creando directorio:', dirErr);
			return;
		}

		fs.writeFile(filepath, emailContent, (err) => {
			if (err) {
				console.error('Error guardando email:', err);
			} else {
				console.log(`Email guardado en: ${filename}`);
			}
		});
	});
	return filename;
}

module.exports = { generateSignedEmail, saveEmail };
