const PatentToken= artifacts.require("PatentToken");
const VendingMachine = artifacts.require("VendingMachine");

module.exports = function(deployer) {
  deployer.deploy(VendingMachine)
  deployer.deploy(PatentToken, 0);
  
};
