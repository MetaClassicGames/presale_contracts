require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");

const privateKey = process.env.DEPLOYER_SIGNER_PRIVATE_KEY;
const apiKey = process.env.ETHERSCAN_API_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      //Stable Coin
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  networks: {
    matic: {
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: [apiKey],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: "EUR",
    token: "MATIC",
    gasPriceApi:
      "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    coinmarketcap: process.env.GAS_KEY,
  },
};
