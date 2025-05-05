// Interactuar con la base de datos de prestamos

const { db_loans, dbReady } = require('./db');
const { fetchAll, execute } = require('./dbHelpers');

/**
 * Obtener los préstamos de un usuario a partir de la dirección de la cartera
 * @param {string} wallet
 * @returns {Promise<Object>}
 */
async function getLoansByWallet(wallet) {
  await dbReady;
  sql = `
    SELECT * FROM loans
    WHERE borrower_address = ? OR lender_address = ?
    ORDER BY id DESC;
`;
  return fetchAll(db_loans, sql, [wallet, wallet])
}

/**
 * Insertar un nuevo préstamo en la base de datos 
 * @param {{} borrower, lender, amount, rate, datesJson }} wallet
 * @returns {Promise<void>}
 */
async function createLoan({ borrower, lender, amount, rate, datesJson }) {
  await dbReady;
  const sql = `
    INSERT INTO loans (borrower_address, lender_address,  amount_eth, interest_rate, payment_dates)
    VALUES (?, ?, ?, ?, ?);
`;
  return execute(db_loans, sql, [borrower, lender, amount, rate, datesJson]);
}

module.exports = { getLoansByWallet, createLoan };
