// Funciones criptográficas

const crypto = require('node:crypto');
const OTP_LENGTH = 6;

/**
 * Calcular el hash de la contraseña
 * @param {string} - Contraseña en texto "claro"
 * @param {string} - Salt para la contraseña
* @returns {{ salt: string, hash: string }} 
 *   hash: hex-encoded derived key
 *   salt: hex-encoded random salt  
 */
function hashPassword(password, salt) {
	return new crypto.createHash('sha256')
		.update(password + salt)
		.digest('hex');
}

/**
 * Verificar que el hash encaja con la contraseña+salt
 * Verify a password against its hash+salt.
 * @param {string} password - Constraseña en texto "claro"
 * @param {string} salt - Salt para la contraseña
 * @param {string} hash - Hash para comprobar
 * @returns {boolean}
 */
function verifyPassword(password, salt, hash) {
	return hashPassword(password, salt) === hash;
}

/*
 * Generar un OTP (one time password) con cierta cantidad de dígitos
 * @param {number} [lenght=OTP_LENGTH] - Número de digitos (por defecto 6)
 * @returns {string} OTP
 */
function generateOTP(lenght = OTP_LENGTH) {
	const max = 10 ** lenght;
	const num = crypto.randomInt(0, max);
	return num.toString().padStart(lenght, '0');
}

module.exports = { hashPassword, verifyPassword, generateOTP };
