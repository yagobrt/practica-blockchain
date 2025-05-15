const { ethers } = require('ethers');

const BLOCK_TAG = 'safe';
const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);


/*
 * Devuelve el balance en la dirección de ETH de acuerdo con el último bloque seguro
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

module.exports = { getWalletBalance };
