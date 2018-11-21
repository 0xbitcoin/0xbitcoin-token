var _0xBitcoinToken = artifacts.require("./_0xBitcoinToken.sol");
var _0xTestToken = artifacts.require("./_0xTestToken.sol");

module.exports = function(deployer) {
  deployer.deploy(_0xBitcoinToken);
  deployer.deploy(_0xTestToken);
};
