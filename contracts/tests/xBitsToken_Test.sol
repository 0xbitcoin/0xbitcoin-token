// Adds Test library to the context

import "@mangrovedao/hardhat-test-solidity/test.sol";

import "./Testable.sol";
import "../xBitsToken.sol";

pragma solidity ^0.8.6;

// `_Test` suffix means it is a test contract
contract xBitsToken_Test is Testable,xBitsToken(address(0)) {


  receive() external payable override(Testable, xBitsToken) {}

  function initialize() internal override{

    epochCount = 100;

    miningTarget = _MAXIMUM_TARGET;

    Test.eq(totalSupply, 21000000 * 10**uint(decimals),"Incorrect total supply");
    
    maxSupplyForEra = totalSupply - (totalSupply / ( 2**(rewardEra + 1)));

    Test.eq(maxSupplyForEra, 10500000 * 10**uint(decimals),"Incorrect total supply");

  }
 
    // `_test` suffix means it is a test function
    function miningEpoch_test() public {

        super._startNewMiningEpoch();

        Test.eq(epochCount,101,"invalid epoch count");
    }

    function adjustDifficuly_test() public {

    Test.eq(miningTarget,_MAXIMUM_TARGET,"invalid mining target");

    super._reAdjustDifficulty(600);

    Test.eq(epochCount,100,"invalid epoch count");
    //Test.eq(miningTarget,_MAXIMUM_TARGET,"invalid mining target");

    miningTarget = _MAXIMUM_TARGET;
    super._reAdjustDifficulty(1);


    miningTarget = _MAXIMUM_TARGET;
    super._reAdjustDifficulty(1024);

    miningTarget = _MAXIMUM_TARGET;
    super._reAdjustDifficulty(1024*60);
  }

  
}