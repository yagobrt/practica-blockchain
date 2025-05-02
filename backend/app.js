require('dotenv').config();

const { createUser, getUserByWallet } = require('./models/userModel');
const { hashPassword, verifyPassword, generateOTP } = require('./services/cryptoHelpers');
const { generateSignedEmail } = require('./services/writeEmail');
const { EmailType } = require('./services/emailTypes');

(async () => {
  try {
    // -- registrar usuario --
    const testUser = {
      username: 'alice',
      wallet: '0xFAKE1234567890',
      email: 'alice@example.com',
      password: 's3cr3tP4ss!'
    };

    const passwordHash = hashPassword(testUser.password, testUser.wallet);
    console.log('Hash:', passwordHash);

// -- insertar en la bd --
/* await */ createUser({
      username: testUser.username,
      passwordHash,
      wallet: testUser.wallet,
      email: testUser.email
    });
    console.log('Usuario creado en la BD.\n');

    // -- email + OTP --
    const otp = generateOTP();
    console.log('OTP:', otp);

    const { message, signature } = generateSignedEmail(EmailType.OTP_CONFIRM, {
      username: testUser.username,
      action: "Registro de nuevo usuario",
      otp: otp
    });

    // "Enviar" email
    console.log("--- INICIO DEL EMAIL   ---\n", message);
    console.log("--- FIN DEl EMAIL      ---\n");
    console.log("--- INICIO DE LA FIRMA ---\n", signature);
    console.log("--- FIN DE LA FIRMA    ---\n");

    // -- LOGIN --
    console.log('Simulando login...');
    console.log('Usuario introducido:\t', testUser.wallet);
    console.log('Contraseña introducida:\t', testUser.password);

    const storedUser = /* await */ getUserByWallet(testUser.wallet);
    if (!storedUser) {
      throw new Error('Usuario no encontrado en la BBDD');
    }
    console.log('Usuario BBDD:', {
      username: storedUser.username,
      wallet: storedUser.wallet,
      email: storedUser.email
    });

    // Verificar contraseña
    const isValid = verifyPassword(
      testUser.password,
      storedUser.wallet,     // salt==wallet
      storedUser.passwordHash
    );
    console.log('¿Contraseña valida / Inicio de sesión válido?', isValid);
  } catch (err) {
    console.error('Error in test flow:', err);
  }
})();
