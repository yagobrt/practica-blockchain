// Firmar un mensaje 

require("dotenv").config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Leer la ruta del .env
const keyPath = process.env.CERT_KEY_PATH;
if (!keyPath) {
	console.error('ERROR: No está definido CERT_KEY_PATH en el archivo .env');
	process.exit(1);
}


// Cargar la clave privada
let privateKey;
try {
	privateKey = fs.readFileSync(path.resolve(keyPath), "utf8");
} catch (err) {
	console.error("ERROR: No se pudo leer la clave privada:", err.message);
	process.exit(1);
}

/**
 * Firmar un mensaje usando RSA SHA256
 * @param {string} message String UTF8 a firmar
 * @returns {string} Firma como un string hexadecimal
 */
function signMessage(message) {
	const signer = crypto.createSign("SHA256");
	signer.update(message);
	signer.end();

	return signer.sign(privateKey, "hex");
}

module.exports = { signMessage };
