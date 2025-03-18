
require("hardhat-gas-reporter");
// require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
//require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const hre = require("hardhat"); 
const web3 = require('web3');

//npx hardhat run scripts/deploy.js --network sepolia

var _guardianaddress = "0x34Fae97547E990ef0E05e05286c51E4645bf1A85 " // sepolia multisig
var _token = "0x80fc34a2f9FfE86F41580F47368289C402DEc660" // sepolia real token
var _tellorFlex = "0xB19584Be015c04cf6CFBF6370Fe94a58b7A38830" // sepolia flex


async function deployForMainnet(_pk, _nodeURL) {
  
    var net = hre.network.name

    await run("compile")

    //Connect to the network
    let privateKey = _pk;
    var provider = new ethers.providers.JsonRpcProvider(_nodeURL)
    let wallet = new ethers.Wallet(privateKey, provider);
    
    ////////  Deploy Blobstream contract  ////////////////////////
    console.log("deploy BlobstreamO bridge")
    const BlobstreamO = await ethers.getContractFactory("contracts/bridge/BlobstreamO.sol:BlobstreamO", wallet);
    var BlobWithSigner = await BlobstreamO.connect(wallet);
    const blobstreamO= await BlobWithSigner.deploy(_guardianaddress);
    await blobstreamO.deployed();
    console.log("BlobstreamO deployed to:", blobstreamO.address);

    ////////  Deploy token bridge contract  ////////////////////////
    console.log("deploy token bridge")
    const TokenBridge = await ethers.getContractFactory("contracts/token-bridge/TokenBridge.sol:TokenBridge", wallet);
    var tbWithSigner = await TokenBridge.connect(wallet);
    /// @param _token address of tellor token for bridging
    /// @param _blobstream address of BlobstreamO data bridge
    /// @param _tellorFlex address of oracle(tellorFlex) on chain
    const tokenBridge= await tbWithSigner.deploy(_token,blobstreamO.address,_tellorFlex);
    await tokenBridge.deployed();
    console.log("Token bridge deployed to:", tokenBridge.address);

//     /////////  Print addresses   ///////////////////////////

//     if (net == "mainnet"){
//             console.log("Tellor token bridge deployed to:", tokenBridge.address);
//             console.log("Tellor token bridge deployed to:", "https://etherscan.io/address/" + tokenBridge.address);
//             console.log("Tellor BlobstreamO bridge deployed to:", blobstreamO.address);
//             console.log("Tellor blobstreamO bridge deployed to:", "https://etherscan.io/address/" + blobstreamO.address);
        
//         }  else if (net == "sepolia"){ 
//             console.log("Tellor token bridge deployed to:", tokenBridge.address);
//             console.log("Tellor token bridge deployed to:", "https://sepolia.etherscan.io/address/" + tokenBridge.address);
//             console.log("Tellor BlobstreamO bridge deployed to:", blobstreamO.address);
//             console.log("Tellor blobstreamO bridge deployed to:", "https://sepolia.etherscan.io/address/" + blobstreamO.address);

//         }  else {
//         console.log("Please add network explorer details")
//     }


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tx confirmation...');
    await tokenBridge.deployTransaction.wait(3)

    console.log('submitting contract for verification...');
    try {
        await run("verify:verify",
        {
            address: blobstreamO.address,
            constructorArguments: [_guardianaddress]
        },
        {
            address: tokenBridge.address,
            constructor: [_token,blobstreamO.address,_tellorFlex]
        }
    )
    console.log("Contract verified")
    } catch (e) {
        console.log(e)
    }

  };

  deployForMainnet(process.env.TESTNET_PK, process.env.NODE_URL_SEPOLIA_TESTNET)
    .then(() => process.exit(0))
    .catch(error => {
	  console.error(error);
	  process.exit(1);
  });
