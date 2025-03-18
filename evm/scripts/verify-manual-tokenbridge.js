const { Etherscan } = require("@nomicfoundation/hardhat-verify/etherscan");
require("dotenv").config();
const ethers = require("ethers");
const fs = require("fs");
const hre = require("hardhat");

// npx hardhat run scripts/verify-manual-tokenbridge.js

// contract details -- update these
const CONTRACT_ADDRESS = "0x3b268Fd9b87469BFCF5355d488eCE38A6C85f764";
const token_address = "0x5bd3b87EEF3348B2b115A2bC92d8c01Aa7a0CEb1";
const blobstream_address = "0x9483A36Fa435d24e15a5dAd857BaA0FB7E2B606d";
const tellor_flex_address = "0x5bd3b87EEF3348B2b115A2bC92d8c01Aa7a0CEb1";

const CONTRACT_PATH_NAME = "contracts/token-bridge/TokenBridge.sol:TokenBridge";

// encode constructor args
const abiCoder = new ethers.utils.AbiCoder();
const encodedArgs = abiCoder.encode(["address", "address", "address"], [token_address, blobstream_address, tellor_flex_address]);
// remove '0x' prefix for etherscan verification
const CONSTRUCTOR_ARGS = encodedArgs.startsWith('0x') ? encodedArgs.slice(2) : encodedArgs;
console.log("CONSTRUCTOR_ARGS", encodedArgs);
console.log("CONSTRUCTOR_ARGS (without 0x)", CONSTRUCTOR_ARGS);

// helper function to sleep
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const instance = new Etherscan(
    process.env.ETHERSCAN, // Etherscan API key
    "https://api-sepolia.etherscan.io/api", // Etherscan API URL
    "https://sepolia.etherscan.io" // Etherscan browser URL
  );

  // Get contract path and name
  const contractPath = CONTRACT_PATH_NAME.split(":")[0];
  const contractName = CONTRACT_PATH_NAME.split(":")[1];
  
  // Load source code from build info
  const buildInfoFiles = await hre.artifacts.getBuildInfoPaths();
  let contractBuildInfo = null;
  
  for (const buildInfoPath of buildInfoFiles) {
    const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
    if (buildInfo.output.contracts[contractPath] && 
        buildInfo.output.contracts[contractPath][contractName]) {
      contractBuildInfo = buildInfo;
      break;
    }
  }
  
  if (!contractBuildInfo) {
    console.error(`Build info not found for ${CONTRACT_PATH_NAME}`);
    process.exit(1);
  }

  // Get compiler version
  const compilerVersion = hre.config.solidity.compilers[0].version;
  const fullVersion = `v${compilerVersion}+commit.7dd6d404`; // You might need to adjust the commit hash

  // Check if already verified
  const isVerified = await instance.isVerified(CONTRACT_ADDRESS);
  if (isVerified) {
    console.log(`Contract ${CONTRACT_ADDRESS} is already verified.`);
    console.log(`Contract URL: ${instance.getContractUrl(CONTRACT_ADDRESS)}`);
    return;
  }

  // Verify contract
  console.log(`Submitting verification request for ${CONTRACT_PATH_NAME} at ${CONTRACT_ADDRESS}...`);
  console.log("Contract source code:", JSON.stringify(contractBuildInfo.input));
  try {
    const { message: guid } = await instance.verify(
      // Contract address
      CONTRACT_ADDRESS,
      // Contract source code (from build info)
      JSON.stringify(contractBuildInfo.input),
      // Contract name
      CONTRACT_PATH_NAME,
      // Compiler version
      fullVersion,
      // Encoded constructor arguments
      CONSTRUCTOR_ARGS
    );

    console.log(`Verification submitted with GUID: ${guid}`);
    console.log("Waiting for verification result...");
    
    await sleep(5000);
    const verificationStatus = await instance.getVerificationStatus(guid);
    console.log(`Verification status: ${verificationStatus.message}`);

    if (verificationStatus.isSuccess()) {
      const contractURL = instance.getContractUrl(CONTRACT_ADDRESS);
      console.log(
        `Successfully verified contract "${CONTRACT_PATH_NAME}" on Etherscan: ${contractURL}`
      );
    } else {
      console.error(`Verification failed: ${verificationStatus.message}`);
    }
  } catch (error) {
    console.error("Verification error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });