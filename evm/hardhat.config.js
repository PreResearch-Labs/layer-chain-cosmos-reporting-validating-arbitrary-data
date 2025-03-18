require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");


module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
      {
        version: "0.7.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
      {
        version: "0.4.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish",
        count: 40,
      },
      forking: {
        url: process.env.NODE_URL,
        blockNumber: 19891853
      },
      allowUnlimitedContractSize: true
    } ,
    sepolia: {
      url: `${process.env.NODE_URL_SEPOLIA}`,
      accounts: [process.env.TESTNET_PK],
      gas: 9000000 ,
      gasPrice: 5000000000
    } ,
    mainnet_testnet: {
      url: `${process.env.NODE_URL_MAINNET_TESTNET}`,
      accounts: [process.env.TESTNET_PK],
      gas: 8000000 ,
      gasPrice: 1000000000
    },
  },

  // // #1
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN
  // },

  // // // #2
  // etherscan: {
  //   apiKey: {
  //     "sepolia": process.env.ETHERSCAN,
  //   },
  //   customChains: [
  //     {
  //       network: "sepolia",
  //       chainId: 11155111,
  //       urls: {
  //         apiURL: "https://api-sepolia.etherscan.io/api",
  //         browserURL: "https://sepolia.etherscan.io/"
  //       }
  //     }
  //   ]
  // },

  // #3
  etherscan: {
    apiKey: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    sepolia: process.env.ETHERSCAN,
    mainnet: process.env.ETHERSCAN
    }
  },
  sourcify: {
    enabled: true,
  },




};


extendEnvironment((hre) => {
  const Web3 = require("web3");
  hre.Web3 = Web3;

  // hre.network.provider is an EIP1193-compatible provider.
  hre.web3 = new Web3(hre.network.provider);
});




