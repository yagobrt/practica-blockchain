require('dotenv').config();
const express = require('express');
const { createUser, getUserByWallet, getPasswordByEmail } = require('./models/userModel');
const { createLoan, getLoansByWallet } = require('./models/loanModel');
const { hashPassword, verifyPassword, generateOTP } = require('./services/cryptoHelpers');
const { generateSignedEmail, saveEmail } = require('./services/writeEmail');
const { verifySignature } = require('./services/signMessage');
const { EmailType } = require('./services/emailTypes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(201).json({ message: 'Bienvenido a P2P bank' });
});

// Registro de usuario
app.post('/api/register', async (req, res) => {
  const { username, wallet, email, password } = req.body;
  try {
    const passwordHash = hashPassword(password, wallet);
    await createUser({ email, wallet, username, passwordHash, salt: wallet });
    const otp = generateOTP();
    const { message, signature } = generateSignedEmail(EmailType.OTP_CONFIRM, {
      username, action: 'Registro de nuevo usuario', otp
    });
    // NOTE: Tal vez habría que extraer formatear los emails a una función
    saveEmail(username, email, "Código de verificación - Registro de nuevo usuario", message, signature);
    res.status(201).json({ message: 'Usuario registrado, OTP enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Comprobar la firma de un mensaje
app.post('/api/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;
    const isCorrect = verifySignature(message, signature);
    console.log(isCorrect);
    if (isCorrect) {
      res.status(200).json({ message: 'La firma del mensaje es válida.' });
    }
    res.status(400).json({ message: 'La firma del mensaje no es válida.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar la firma' });
  }
});

// Consulta de usuario
app.get('/api/user/:wallet', async (req, res) => {
  try {
    const user = await getUserByWallet(req.params.wallet);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario.' });
  }
});

// Crear un préstamo
app.post('/api/loan', async (req, res) => {
  const { borrower, lender, amount, rate, datesJson } = req.body;
  try {
    await createLoan({ borrower, lender, amount, rate, datesJson });

    // Email para prestamista (lender)
    const { username: lUser, email: lEmail } = await getUserByWallet(lender);
    const lenderOtp = generateOTP();
    const { message: lenderMsg, signature: lenderSign } = generateSignedEmail(EmailType.OTP_CONFIRM, {
      username: lUser, action: 'Crear préstamo', otp: lenderOtp
    });
    saveEmail(lUser, lEmail, "Código de verificación - Registro de nuevo préstamo", lenderMsg, lenderSign);

    // Email para prestatario (borrower)
    const { username: bUser, email: bEmail } = await getUserByWallet(borrower);
    const borrowerOtp = generateOTP();
    const { message: borrowerMsg, signature: borrowerSign } = generateSignedEmail(EmailType.OTP_CONFIRM, {
      username: bUser, action: 'Crear préstamo', otp: borrowerOtp
    });
    saveEmail(bUser, bEmail, "Código de verificación - Registro de nuevo préstamo", borrowerMsg, borrowerSign);
    res.status(201).json({ message: 'Préstamo registrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear préstamo.' });
  }
});

// Consultar préstamos
app.get('/api/loans/:wallet', async (req, res) => {
  try {
    const loans = await getLoansByWallet(req.params.wallet);
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamos.' });
  }
});

module.exports = app;

