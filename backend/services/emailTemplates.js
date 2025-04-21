const { EmailType } = require('./emailTypes')

/**
 * Template para cada tipo de email
 * @type {Record<EmailType, function(Object): string>}
 */
const templates = {
	[EmailType.PASSWORD_CHANGE]: ({ username, resetLink }) => `
Hola ${username},

Has solicitado un cambio de contraseña. Haz click en este link para cambiarla:
${resetLink}

Si no has sido tú, ponte en contacto con nuestro equipo de soporte: mailto:support@p2p.bank
`,
	[EmailType.PASSWORD_RESET]: ({ username, resetLink }) => `
Hola ${username},

Has solicitado resetear tu contraseña. Haz click en este link para crear una nueva:
${resetLink}

Si no has sido tú, ponte en contacto con nuestro equipo de soporte: mailto:support@p2p.bank
`,
	[EmailType.TRANSACTION_CONFIRM]: ({ username, txHash, amount }) => `
Hola ${username},

Tu transacción de ${amount} ETH ha sido confirmada.
Puedes verla en Etherscan: https://sepolia.etherscan.io/tx/${txHash}

¡Gracias por usar nuestros servicios!
`,
	[EmailType.OTP_CONFIRM]: ({ username, action, otp }) => `
Hola ${username},

Necesitas introducir un código para verificar tu identidad y continuar la siguiente acción: ${action}.
Tu código de verificación es:
${otp}

El código expirará en 5 minutos, si has recibido un código más reciente puedes ignora este email.

Si tú no has hecho esta solicidud, ponte en contacto con nuestro equipo de soporte: mailto:support@p2p.bank
`
};

module.exports =  { templates };
