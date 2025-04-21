/**
 * @readonly
 * @enum {string}
 */
const EmailType = Object.freeze({
	PASSWORD_CHANGE: "PASSWORD_CHANGE",
	PASSWORD_RESET: "PASSWORD_RESET",
	TRANSACTION_CONFIRM: "TRANSACTION_CONFIRM",
	OTP_CONFIRM: "OTP_CONFIRM",
	// TODO: Crear el resto
});

module.exports = { EmailType };
