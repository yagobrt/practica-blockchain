// Interactuar con la base de datos de usuarios

const { db_users, dbReady } = require('./db');
const { fetchFirst, execute } = require('./dbHelpers');

/**
 * Insertar un nuevo usuario en la base de datos 
 * @param {{ email: string, wallet: string, username: string, passwordHash: string, salt: string }} userData
 * @returns {Promise<void>}
 */
async function createUser({ email, wallet, username, passwordHash, salt }) {
  await dbReady;
  const sql = `
  INSERT INTO users (email, wallet, username, password, salt)
  VALUES (?, ?, ?, ?, ?);
`;
  return execute(db_users, sql, [email, wallet, username, passwordHash, salt])
}

/**
 * Obtener la info de un usuario a partir de la dirección de la cartera
 * @param {string} - wallet
 * @returns {Promise<Object>}
 */
async function getUserByWallet(wallet) {
  await dbReady;
  const sql = `SELECT username, wallet, email FROM users WHERE wallet = ? LIMIT 1`;
  return fetchFirst(db_users, sql, [wallet]);
}

/**
 * Obtener la info de un usuario a partir de la dirección de correo
 * @param {string} - correo
 * @returns {Promise<Object>}
 */
async function getUserByEmail(email) {
  await dbReady;
  const sql = `SELECT username, wallet, email FROM users WHERE email = ? LIMIT 1`;
  return fetchFirst(db_users, sql, [email]);
}

/**
 * Obtener la constraseña y el salt a partir de la dirección de correo
 * @param {string} - correo
 * @returns {Promise<Object>}
 */
async function getPasswordByEmail(email) {
  await dbReady;
  const sql = `SELECT password, salt FROM users WHERE email = ? LIMIT 1`;
  return fetchFirst(db_users, sql, [email]);
}


module.exports = { createUser, getUserByWallet, getUserByEmail, getPasswordByEmail };
