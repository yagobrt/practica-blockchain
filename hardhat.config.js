require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.METAMASK_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
};

