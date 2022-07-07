// Adds Test library to the context
import "@mangrovedao/hardhat-test-solidity/test.sol";
pragma solidity ^0.8.6;

// `_Test` suffix means it is a test contract
contract xBitsToken_Test {

  receive() external payable {} // necessary to receive eth from test runner

  // `_test` suffix means it is a test function
  function addition_test() public {
    prepare();
    // Logging will be interpreted by hardhat-test-solidity
    Test.eq(4,2+2,"oh no");
  }

  // Will not be interpreted as a test function
  function prepare() public {}
}