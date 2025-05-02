// Interactuar con la base de datos de usuarios

const { db_users } = require('./db');
const { fetchFirst, execute } = require('./dbHelpers');

/**
 * Insertar un nuevo usuario en la base de datos 
 * @param {{ wallet: string, username: string, passwordHash: string, email: string }} userData
 * @returns {Promise<void>}
 */
async function createUser({ wallet, username, passwordHash, email }) {
  const sql = `
  INSERT INTO users (wallet, username, password, email)
  VALUES (?, ?, ?, ?);
`;
  console.log("createUser | DB:", db_users)
  return execute(db_users, sql, [wallet, username, passwordHash, email])
}

/**
 * Obtener la info de un usuario a partir de la dirección de la cartera
 * @param {string} - wallet
 * @returns {Promise<Object>}
 */
async function getUserByWallet(wallet) {
  const sql = `SELECT username, wallet, email FROM users WHERE wallet = ? LIMIT 1`;
  console.log("getUserByWallet | DB:", db_users)
  return fetchFirst(db_users, sql, [wallet]);
}

module.exports = { getUserByWallet, createUser };
