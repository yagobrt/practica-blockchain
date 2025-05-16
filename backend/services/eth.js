// Funciones para interactuar con la blockchain
const { ethers } = require('ethers');

const BLOCK_TAG = 'safe';
const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);


/*
 * Devuelve el balance en la dirección de ETH de acuerdo con el último bloque seguro
 * @param {string} address - Dirección Ethereum a consultar (formato 0x...).
 * @returns {Promise<string>} Balance formateado en ETH
 * @throws {Error} Si ocurre un fallo al comunicarse con el proveedor RPC.
 */
async function getWalletBalance(address) {
  try {
    const balanceWei = await provider.send('eth_getBalance', [address, BLOCK_TAG]);
    const balanceEth = ethers.formatEther(balanceWei);
    return balanceEth;
  } catch (err) {
    console.error('Error al obtener balance:', err);
    throw new Error('No se pudo obtener el balance de la wallet');
  }
}

/**
 * Obtiene las últimas transacciones normales de una dirección en Sepolia.
 * @param {string} address - Dirección Ethereum.
 * @param {number} limit - Número máximo de transacciones a obtener.
 * @returns {Promise<Object[]>} Lista de transacciones.
 */
async function getLastTransactions(address, limit = 10) {
  const url = `https://api.etherscan.io/v2/api` +
    `?chainid=11155111` +
    `&module=account` +
    `&action=txlist` +
    `&address=${address}` +
    `&startblock=0` +
    `&endblock=99999999` +
    `&page=1` +
    `&offset=${limit}` +
    `&sort=desc` +     // orden descendente para las más recientes
    `&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  return json.result;
}

module.exports = { getWalletBalance, getLastTransactions };
