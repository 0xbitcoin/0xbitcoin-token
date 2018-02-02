pragma solidity ^0.4.18;


// ----------------------------------------------------------------------------

// '0xBitcoin Token' contract

//

// Symbol      : 0xBTC

// Name        : 0xBitcoin Token

// Total supply: 21,000,000.00

// Decimals    : 8

//


// ----------------------------------------------------------------------------



// ----------------------------------------------------------------------------

// Safe maths

// ----------------------------------------------------------------------------

library SafeMath {

    function add(uint a, uint b) internal pure returns (uint c) {

        c = a + b;

        require(c >= a);

    }

    function sub(uint a, uint b) internal pure returns (uint c) {

        require(b <= a);

        c = a - b;

    }

    function mul(uint a, uint b) internal pure returns (uint c) {

        c = a * b;

        require(a == 0 || c / a == b);

    }

    function div(uint a, uint b) internal pure returns (uint c) {

        require(b > 0);

        c = a / b;

    }

}



// ----------------------------------------------------------------------------

// ERC Token Standard #20 Interface

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md

// ----------------------------------------------------------------------------

contract ERC20Interface {

    function totalSupply() public constant returns (uint);

    function balanceOf(address tokenOwner) public constant returns (uint balance);

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);

    function transfer(address to, uint tokens) public returns (bool success);

    function approve(address spender, uint tokens) public returns (bool success);

    function transferFrom(address from, address to, uint tokens) public returns (bool success);


    event Transfer(address indexed from, address indexed to, uint tokens);

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

}



// ----------------------------------------------------------------------------

// Contract function to receive approval and execute function in one call

//

// Borrowed from MiniMeToken

// ----------------------------------------------------------------------------

contract ApproveAndCallFallBack {

    function receiveApproval(address from, uint256 tokens, address token, bytes data) public;

}



// ----------------------------------------------------------------------------

// Owned contract

// ----------------------------------------------------------------------------

contract Owned {

    address public owner;

    address public newOwner;


    event OwnershipTransferred(address indexed _from, address indexed _to);


    function Owned() public {

        owner = msg.sender;

    }


    modifier onlyOwner {

        require(msg.sender == owner);

        _;

    }


    function transferOwnership(address _newOwner) public onlyOwner {

        newOwner = _newOwner;

    }

    function acceptOwnership() public {

        require(msg.sender == newOwner);

        OwnershipTransferred(owner, newOwner);

        owner = newOwner;

        newOwner = address(0);

    }

}



// ----------------------------------------------------------------------------

// ERC20 Token, with the addition of symbol, name and decimals and an

// initial fixed supply

// ----------------------------------------------------------------------------

contract _0xBitcoinToken is ERC20Interface, Owned {

    using SafeMath for uint;


    string public symbol;

    string public  name;

    uint8 public decimals;

    uint public _totalSupply;



      //ethereum block number when last 0xbtc was minted
  //  uint public latestMiningEpochStarted;

    uint public latestDifficultyPeriodStarted;



    uint public epochCount;//number of 'blocks' mined


    uint public _BLOCKS_PER_READJUSTMENT = 2016;

    uint public  _MINIMUM_DIFFICULTY = 6;

    uint public  _MAXIMUM_DIFFICULTY = 54;



    uint public miningDifficulty; //adjusts every 2016 epochs (or blocks)

    bytes32 public challengeNumber;   //generate a new one when a new reward is minted



    uint public rewardEra;
    uint public maxSupplyForEra;

    mapping(bytes32 => uint) rewardHashesFound; //the hash and the nonce

    uint public tokensMinted;

    mapping(address => uint) balances;



    mapping(address => mapping(address => uint)) allowed;




    event Mint(address indexed from, uint reward_amount, uint difficulty, bytes32 newChallengeNumber);

    // ------------------------------------------------------------------------

    // Constructor

    // ------------------------------------------------------------------------

    function _0xBitcoinToken() public onlyOwner{

        symbol = "0xBTC";

        name = "0xBitcoin Token";

        decimals = 8;

        _totalSupply = 21000000 * 10**uint(decimals);
        tokensMinted = 0;

        rewardEra = 0;
        maxSupplyForEra = _totalSupply.div(2);

        miningDifficulty = _MINIMUM_DIFFICULTY;

        latestDifficultyPeriodStarted = block.number;

        _startNewMiningEpoch();

        //balances[owner] = _totalSupply;

        //Transfer(address(0), owner, _totalSupply);

    }

    function _startNewMiningEpoch() internal {//a new block to be mined

      //latestMiningEpochStarted = block.number;

      if(tokensMinted >= maxSupplyForEra && rewardEra < 32) //32 is the final era, almost all tokens minted
      {
        rewardEra = rewardEra + 1;
      }

      //set the next minted supply at which the era will change
      maxSupplyForEra = _totalSupply - _totalSupply.div( 2**(rewardEra + 1));

      //make the latest ethereum block hash a part of the next challenge for PoW to prevent pre-mining future blocks
      challengeNumber = block.blockhash(block.number - 1);


      epochCount = epochCount.add(1);

      //every so often, readjust difficulty, dont readjust when deploying
      if(epochCount % _BLOCKS_PER_READJUSTMENT == 0)
      {
        _reAdjustDifficulty();
      }



    }




    //https://en.bitcoin.it/wiki/Difficulty#What_is_the_formula_for_difficulty.3F
    //as of 2017 the bitcoin difficulty was up to 17 zeroes, it was only 8 in the early days
    function _reAdjustDifficulty() internal {


        uint ethBlocksSinceLastDifficultyPeriod = block.number - latestDifficultyPeriodStarted;


        //assume 360 ethereum blocks per hour

        //we want miners to spend 10 minutes to mine each 'block', about 60 ethereum blocks = one 0xbitcoin epoch
        uint epochsMined = _BLOCKS_PER_READJUSTMENT;
        uint targetEthBlocksPerEpoch = epochsMined * 60;

        if( ethBlocksSinceLastDifficultyPeriod < targetEthBlocksPerEpoch )
        {
          miningDifficulty = miningDifficulty + 2;
        }else{
          miningDifficulty = miningDifficulty - 2;
        }


        //miningDifficultyDelta
        //miningDifficulty += miningDifficultyDelta

        latestDifficultyPeriodStarted = block.number;

        if(miningDifficulty < _MINIMUM_DIFFICULTY) //6
        {
          miningDifficulty = _MINIMUM_DIFFICULTY;
        }

        if(miningDifficulty > _MAXIMUM_DIFFICULTY) //54
        {
          miningDifficulty = _MAXIMUM_DIFFICULTY;
        }
    }


    /*function mintTest(uint256 nonce, bytes32 challenge_digest) public returns (bytes1 digesttest) {

        uint difficulty = getMiningDifficulty();
        uint reward_amount = getMiningReward();

        bytes32 digest = keccak256(challengeNumber,msg.sender,nonce);
        //this is not turning out right !!

        //bytes memory characters = bytes(digest);

        return digest[1];


      }*/

    function mint(uint256 nonce, bytes32 challenge_digest) public returns (bool success) {

        uint difficulty = getMiningDifficulty();
        uint reward_amount = getMiningReward();

        //the PoW must contain work that includes a recent etherum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
        bytes32 digest =  keccak256(challengeNumber, msg.sender, nonce );

        //the challenge digest must match the expected
        if (digest != challenge_digest) revert();

        //the digest must start with X zeroes where X is the difficulty
         for(uint i = 0; i < difficulty.div(2)   ; i++) {
            if (digest[i] != 0x00 ) revert();
         }

         uint hashFound = rewardHashesFound[digest];

         rewardHashesFound[digest] = difficulty;

         if(hashFound != 0) revert();  //prevent the same answer from awarding twice



        balances[msg.sender] = balances[msg.sender].add(reward_amount);


        tokensMinted = tokensMinted.add(reward_amount);



         _startNewMiningEpoch();

          Mint(msg.sender, reward_amount, difficulty, challengeNumber );

       return true;

    }


    function getChallengeNumber() public constant returns (bytes32) {
        return challengeNumber;
        //return (tokensMinted.div(100000)).mul(2).add(2);

    }

    //The difficulty is the number of zeroes that the hash needs to begin with
    //This is equal to '2' plus another two per 100,000 coins that have been mined
    function getMiningDifficulty() public constant returns (uint) {
        return miningDifficulty;
        //return (tokensMinted.div(100000)).mul(2).add(2);

    }

    //21m coins total
    function getMiningReward() public constant returns (uint) {
        //once we get half way thru the coins, only get 25 per block

         //every reward era, the reward amount halves.

         return (50 * 10**uint(decimals) ).div( 2**rewardEra ) ;

    }

    // ------------------------------------------------------------------------

    // Total supply

    // ------------------------------------------------------------------------

    function totalSupply() public constant returns (uint) {

        return _totalSupply  - balances[address(0)];

    }



    // ------------------------------------------------------------------------

    // Get the token balance for account `tokenOwner`

    // ------------------------------------------------------------------------

    function balanceOf(address tokenOwner) public constant returns (uint balance) {

        return balances[tokenOwner];

    }



    // ------------------------------------------------------------------------

    // Transfer the balance from token owner's account to `to` account

    // - Owner's account must have sufficient balance to transfer

    // - 0 value transfers are allowed

    // ------------------------------------------------------------------------

    function transfer(address to, uint tokens) public returns (bool success) {

        balances[msg.sender] = balances[msg.sender].sub(tokens);

        balances[to] = balances[to].add(tokens);

        Transfer(msg.sender, to, tokens);

        return true;

    }



    // ------------------------------------------------------------------------

    // Token owner can approve for `spender` to transferFrom(...) `tokens`

    // from the token owner's account

    //

    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md

    // recommends that there are no checks for the approval double-spend attack

    // as this should be implemented in user interfaces

    // ------------------------------------------------------------------------

    function approve(address spender, uint tokens) public returns (bool success) {

        allowed[msg.sender][spender] = tokens;

        Approval(msg.sender, spender, tokens);

        return true;

    }



    // ------------------------------------------------------------------------

    // Transfer `tokens` from the `from` account to the `to` account

    //

    // The calling account must already have sufficient tokens approve(...)-d

    // for spending from the `from` account and

    // - From account must have sufficient balance to transfer

    // - Spender must have sufficient allowance to transfer

    // - 0 value transfers are allowed

    // ------------------------------------------------------------------------

    function transferFrom(address from, address to, uint tokens) public returns (bool success) {

        balances[from] = balances[from].sub(tokens);

        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);

        balances[to] = balances[to].add(tokens);

        Transfer(from, to, tokens);

        return true;

    }



    // ------------------------------------------------------------------------

    // Returns the amount of tokens approved by the owner that can be

    // transferred to the spender's account

    // ------------------------------------------------------------------------

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining) {

        return allowed[tokenOwner][spender];

    }



    // ------------------------------------------------------------------------

    // Token owner can approve for `spender` to transferFrom(...) `tokens`

    // from the token owner's account. The `spender` contract function

    // `receiveApproval(...)` is then executed

    // ------------------------------------------------------------------------

    function approveAndCall(address spender, uint tokens, bytes data) public returns (bool success) {

        allowed[msg.sender][spender] = tokens;

        Approval(msg.sender, spender, tokens);

        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, this, data);

        return true;

    }



    // ------------------------------------------------------------------------

    // Don't accept ETH

    // ------------------------------------------------------------------------

    function () public payable {

        revert();

    }



    // ------------------------------------------------------------------------

    // Owner can transfer out any accidentally sent ERC20 tokens

    // ------------------------------------------------------------------------

    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {

        return ERC20Interface(tokenAddress).transfer(owner, tokens);

    }

}
