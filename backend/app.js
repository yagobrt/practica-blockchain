const { EmailType } = require('./services/emailTypes');
const { generateSignedEmail } = require('./services/writeEmail');

let mensaje, firmaHex;
let test_data = {
  username: "yago",
  resetLink: "https://google.com",
  action: "Cambiar contraseña",
  otp: "1a2b3c",
  txHash: "01234567890abc",
  amount: 10,
};

({ message: mensaje, signature: firmaHex } = generateSignedEmail(EmailType.PASSWORD_CHANGE, test_data));
console.log("--- INICIO DEL EMAIL   ---\n", mensaje);
console.log("--- FIN DEl EMAIL      ---\n");
console.log("--- INICIO DE LA FIRMA ---\n", firmaHex);
console.log("--- FIN DE LA FIRMA    ---");

({ message: mensaje, signature: firmaHex } = generateSignedEmail(EmailType.OTP_CONFIRM, test_data));
console.log("--- INICIO DEL EMAIL   ---\n", mensaje);
console.log("--- FIN DEl EMAIL      ---\n");
console.log("--- INICIO DE LA FIRMA ---\n", firmaHex);
console.log("--- FIN DE LA FIRMA    ---");

test_data.action = "Iniciar sesión";
test_data.otp = "4d5e6f";
({ message: mensaje, signature: firmaHex } = generateSignedEmail(EmailType.OTP_CONFIRM, test_data));
console.log("--- INICIO DEL EMAIL   ---\n", mensaje);
console.log("--- FIN DEl EMAIL      ---\n");
console.log("--- INICIO DE LA FIRMA ---\n", firmaHex);
console.log("--- FIN DE LA FIRMA    ---");



({ message: mensaje, signature: firmaHex } = generateSignedEmail(EmailType.TRANSACTION_CONFIRM, test_data));
console.log("--- INICIO DEL EMAIL   ---\n", mensaje);
console.log("--- FIN DEl EMAIL      ---\n");
console.log("--- INICIO DE LA FIRMA ---\n", firmaHex);
console.log("--- FIN DE LA FIRMA    ---");
