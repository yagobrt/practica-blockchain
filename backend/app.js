require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createUser, getUserByWallet, getUserByEmail, getPasswordByEmail } = require('./models/userModel');
const { createLoan, getLoansByWallet } = require('./models/loanModel');
const { hashPassword, verifyPassword, generateOTP } = require('./services/cryptoHelpers');
const { generateSignedEmail, saveEmail } = require('./services/writeEmail');
const { verifySignature } = require('./services/signMessage');
const { getWalletBalance, getLastTransactions } = require('./services/eth');
const { EmailType } = require('./services/emailTypes');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/')));
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect("/registro.html")
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
    saveEmail(username, email, "Código de verificación - Registro de nuevo usuario", message, signature);
    res.status(201).json({ message: 'Usuario registrado, OTP enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { password: storedHash, salt } = await getPasswordByEmail(email);
    const pswdIsValid = verifyPassword(password, salt, storedHash);
    if (pswdIsValid) {
      const user = await getUserByEmail(email);
      const username = user.username;
      const otp = generateOTP();
      const { message, signature } = generateSignedEmail(EmailType.OTP_CONFIRM, {
        username, action: 'Inicio de sesión', otp
      });
      saveEmail(username, email, "Código de verificación - Inicio de sesión", message, signature);
      res.status(201).json({ message: 'Sesión iniciada, OTP enviado.' });
    } else {
      res.status(401).json({ error: 'El email o la contraseña no son válidos' })
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// Comprobar la firma de un mensaje
app.post('/api/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;
    const isCorrect = verifySignature(message, signature);
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
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const balance = await getWalletBalance(user.wallet);
    res.json({
      username: user.username,
      wallet: user.wallet,
      email: user.email,
      balance: balance || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la información del usuario.' });
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
    const rawLoans = await getLoansByWallet(req.params.wallet);
    const loans = rawLoans.map(loan => {
      const dates = JSON.parse(loan.payment_dates);
      const now = Date.now();
      const futureDates = dates
        .map(d => new Date(d))
        .filter(d => d.getTime() >= now)
        .sort((a, b) => a - b);
      const next_payment = (futureDates.length > 0)
        ? futureDates[0].toISOString()
        : null;
      return next_payment
        ? { ...loan, next_payment }
        : null;
    }).filter(Boolean);

    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener préstamos.' });
  }
});

// Consultar transacciones
app.get('/api/txs/:wallet', async (req, res) => {
  try {
    const txs = await getLastTransactions(req.params.wallet);
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error al obtener las últimas transacciones\n${err}` })
  }
})

module.exports = app;

