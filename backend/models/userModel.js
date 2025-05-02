// Interactuar con la base de datos de usuarios

const { db_users } = require('./db');
const { fetchFirst, execute } = require('./dbHelpers');

/**
 * Insertar un nuevo usuario en la base de datos 
 * @param {{ username: string, passwordHash: string, wallet: string, email: string }} userData
 * @param {Promise<void>}
 */
async function createUser({ username, passwordHash, wallet, email }) {
  const query = `
  INSERT INTO users (username, password, wallet, email)
  VALUES (?, ?, ?, ?)
`;
  return execute(db_users, sql, [username, passwordHash, wallet, email])
}

/**
 * Obtener la info de un usuario a partir de la dirección de la cartera
 * @param {string} - wallet
 * @returns {Promise<Object>}
 */
async function getUserByWallet(wallet) {
  const query = `SELECT id, username, wallet, email FROM users WHERE wallet = ? LIMIT 1`;
  return fetchFirst(db_users, sql, [wallet]);
}

module.exports = { getUserByWallet, createUser };
