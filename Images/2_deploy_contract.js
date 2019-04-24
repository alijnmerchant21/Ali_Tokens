var AliToken = artifacts.require("./AliToken.sol");
var AliTokenSale = artifacts.require("./AliTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(AliToken, 1000000).then(function(){
  	var tokenPrice = 100000000000000;
  return deployer.deploy(AliTokenSale, AliToken.address, tokenPrice);	
  });
  
};
