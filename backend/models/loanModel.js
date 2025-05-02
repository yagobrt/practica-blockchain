// Interactuar con la base de datos de prestamos

const { db_loans } = require('./db');
const { fetchAll } = require('./dbHelpers');

/**
 * Obtener los préstamos de un usuario a partir de la dirección de la cartera
 * @param {string} wallet
 * @returns {Promise<Object>}
 */
async function getLoansByWallet(wallet) {
  sql = `
    SELECT id, borrower_wallet, lender_wallet, amount, status
    FROM loans
    WHERE borrower_wallet = ? OR lender_wallet = ?
    ORDER BY created_at DESC
`;
return fetchAll(db_loans, sql, [wallet, wallet])
}

module.exports = { getLoansByWallet };


