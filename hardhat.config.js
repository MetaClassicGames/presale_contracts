require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
      },
      //Stable Coin
      {
        version: "0.6.12",
      },
    ],
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
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["RookieE0", "ProE0", "LegendE0", "AmateurE0"],
  },
};
