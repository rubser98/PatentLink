const { toWei } = require('web3').utils;

const PatentToken= artifacts.require("PatentToken");
const PatentNFT= artifacts.require("PatentNFT");

module.exports = async function(deployer) {
  const filingFee = toWei('0.1','ether');
  await deployer.deploy(PatentToken, filingFee);
  const patentTokenInstance = await PatentToken.deployed();
  //deployer.deploy(PatentNFT);
  await deployer.deploy(PatentNFT, patentTokenInstance.address)
  
};
