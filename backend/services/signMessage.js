// Firmar un mensaje 

require("dotenv").config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Leer la ruta del .env
const privKeyPath = process.env.PRIV_KEY_PATH;
if (!privKeyPath) {
	console.error('ERROR: No está definido PRIV_KEY_PATH en el archivo .env');
	process.exit(1);
}


// Cargar la clave privada
let privateKey;
try {
	privateKey = fs.readFileSync(path.resolve(privKeyPath), "utf8");
} catch (err) {
	console.error("ERROR: No se pudo leer la clave privada:", err.message);
	process.exit(1);
}

// Leer la ruta del .env
const publKeyPath = process.env.PUBL_KEY_PATH;
if (!publKeyPath) {
	console.error('ERROR: No está definido PUBL_KEY_PATH en el archivo .env');
	process.exit(1);
}

// Cargar la clave pública
let publicKey;
try {
	publicKey = fs.readFileSync(path.resolve(publKeyPath), "utf8");
} catch (err) {
	console.error("ERROR: No se pudo leer la clave pública:", err.message);
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


/**
 * Verifica la firma de un mensaje
 * @param {string} message Mensaje 
 * @param {string} signature 
 * @returns {boolean} Verdadero si la firma es correcta
 */
function verifySignature(message, signature) {
	const verifier = crypto.createVerify("SHA256");
	verifier.write(message);
	verifier.end();

	return verifier.verify(publicKey, signature, "hex");
}

module.exports = { signMessage, verifySignature };
