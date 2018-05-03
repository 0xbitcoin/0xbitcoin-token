pragma solidity ^0.4.23;

// ----------------------------------------------------------------------------

// '0xCatether Token' contract

// Mineable ERC20 Token using Proof Of Work

//

// Symbol      : 0xCATE

// Name        : 0xCatether Token

// Total supply: No Limit

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



library ExtendedMath {


    //return the smaller of the two inputs (a or b)
    function limitLessThan(uint a, uint b) internal pure returns (uint c) {

        if(a > b) return b;

        return a;

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


    constructor() public {

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

        emit OwnershipTransferred(owner, newOwner);

        owner = newOwner;

        newOwner = address(0);

    }

}


// ----------------------------------------------------------------------------

// ERC20 Token, with the addition of symbol, name and decimals and an

// initial fixed supply

// ----------------------------------------------------------------------------

contract _0xCatetherToken is ERC20Interface, Owned {

    using SafeMath for uint;
    using ExtendedMath for uint;


    string public symbol;

    string public  name;

    uint8 public decimals;

    uint public _totalSupply;



    uint public latestDifficultyPeriodStarted;


    uint public epochCount;//number of 'blocks' mined

    //a little number
    uint public  _MINIMUM_TARGET = 2**16;


    //a big number is easier ; just find a solution that is smaller
    //uint public  _MAXIMUM_TARGET = 2**224;  bitcoin uses 224
    uint public  _MAXIMUM_TARGET = 2**224;


    uint public miningTarget;

    bytes32 public challengeNumber;   //generate a new one when a new reward is minted


    address public lastRewardTo;
    uint public lastRewardAmount;
    uint public lastRewardEthBlockNumber;

    // a bunch of maps to know where this is going (pun intended)
    
    mapping(bytes32 => bytes32) solutionForChallenge;
    mapping(uint => uint) targetForEpoch;
    mapping(uint => uint) timeStampForEpoch;

    mapping(address => uint) balances;
    mapping(address => address) donationsTo;


    mapping(address => mapping(address => uint)) allowed;

    event Donation(address donation);
    event DonationAddressOf(address donator, address donnationAddress);
    event Mint(address indexed from, uint reward_amount, uint epochCount, bytes32 newChallengeNumber);

    // ------------------------------------------------------------------------

    // Constructor

    // ------------------------------------------------------------------------

    constructor() public{

        symbol = "0xCATE";
        
        name = "0xCatether Token";
        
        decimals = 4;
        epochCount = 0;
        _totalSupply = 1337000000*10**uint(decimals); 
        
        targetForEpoch[epochCount] = _MAXIMUM_TARGET;
        challengeNumber = "GENESIS_BLOCK";
        solutionForChallenge[challengeNumber] = "42"; // ahah yes
        timeStampForEpoch[epochCount] = block.timestamp;
        latestDifficultyPeriodStarted = block.number;
        
        epochCount = epochCount.add(1);
        targetForEpoch[epochCount] = _MAXIMUM_TARGET;
        miningTarget = _MAXIMUM_TARGET;
        
        balances[owner] = _totalSupply;
        emit Transfer(address(0), owner, _totalSupply);
    }




        function mint(uint256 nonce, bytes32 challenge_digest) public returns (bool success) {

            //the PoW must contain work that includes a recent ethereum block hash (challenge number) and the msg.sender's address to prevent MITM attacks
            bytes32 digest =  keccak256(challengeNumber, msg.sender, nonce );

            //the challenge digest must match the expected
            if (digest != challenge_digest) revert();

            //the digest must be smaller than the target
            if(uint256(digest) > miningTarget) revert();


            //only allow one reward for each challenge
            bytes32 solution = solutionForChallenge[challenge_digest];
            solutionForChallenge[challengeNumber] = digest;
            if(solution != 0x0) revert();  //prevent the same answer from awarding twice


            uint reward_amount = getMiningReward(digest);

            balances[msg.sender] = balances[msg.sender].add(reward_amount);

            _totalSupply = _totalSupply.add(reward_amount);

            //set readonly diagnostics data
            lastRewardTo = msg.sender;
            lastRewardAmount = reward_amount;
            lastRewardEthBlockNumber = block.number;

            _startNewMiningEpoch();

            emit Mint(msg.sender, reward_amount, epochCount, challengeNumber );

           return true;

        }


    //a new 'block' to be mined
    function _startNewMiningEpoch() internal {
        
        timeStampForEpoch[epochCount] = block.timestamp;
        epochCount = epochCount.add(1);
    
      //Difficulty adjustment following the DigiChieldv3 implementation (Tempered-SMA)
      // Allows more thorough protection against multi-pool hash attacks
      // https://github.com/zawy12/difficulty-algorithms/issues/9
        miningTarget = _reAdjustDifficulty(epochCount);

      //make the latest ethereum block hash a part of the next challenge for PoW to prevent pre-mining future blocks
      //do this last since this is a protection mechanism in the mint() function
      challengeNumber = blockhash(block.number - 1);

    }




    //https://github.com/zawy12/difficulty-algorithms/issues/21
    //readjust the target via a tempered EMA
    function _reAdjustDifficulty(uint epoch) internal returns (uint) {
    
        uint timeTarget = 300;  // We want miners to spend 5 minutes to mine each 'block'
        uint N = 6180;          //N = 1000*n, ratio between timeTarget and windowTime (31-ish minutes)
                                // (Ethereum doesn't handle floating point numbers very well)
        uint elapsedTime = timeStampForEpoch[epoch.sub(1)] - timeStampForEpoch[epoch.sub(2)];
        targetForEpoch[epoch] = (targetForEpoch[epoch.sub(1)] * 10000) / (6180 + 3920*N/( N - 984 + 1000*elapsedTime/timeTarget) );
        //              newTarget   =   Tampered EMA-retarget on the last 6 blocks (a bit more, it's an approximation)
        latestDifficultyPeriodStarted = block.number;
        return targetForEpoch[epoch];
    }


    //this is a recent ethereum block hash, used to prevent pre-mining future blocks
    function getChallengeNumber() public constant returns (bytes32) {
        return challengeNumber;
    }

    //the number of zeroes the digest of the PoW solution requires.  Auto adjusts
     function getMiningDifficulty() public constant returns (uint) {
        return _MAXIMUM_TARGET.div(targetForEpoch[epochCount]);
    }

    function getMiningTarget() public constant returns (uint) {
       return targetForEpoch[epochCount];
   }



    //There's no limit to the coin supply
    //reward follows more or less the same emmission rate as Dogecoins'. 5 minutes per block / 105120 block in one year (roughly)
    function getMiningReward(bytes32 digest) public constant returns (uint) {
        
        if(epochCount > 160000) return (50000   * 10**uint(decimals) );                                   //  14.4 M/day / ~ 1.0B Tokens in 20'000 blocks (coin supply @100'000th block ~ 150 Billions)
        if(epochCount > 140000) return (75000   * 10**uint(decimals) );                                   //  21.6 M/day / ~ 1.5B Tokens in 20'000 blocks (coin supply @100'000th block ~ 149 Billions)
        if(epochCount > 120000) return (125000  * 10**uint(decimals) );                                  //  36.0 M/day / ~ 2.5B Tokens in 20'000 blocks (coin supply @100'000th block ~ 146 Billions)
        if(epochCount > 100000) return (250000  * 10**uint(decimals) );                                  //  72.0 M/day / ~ 5.0B Tokens in 20'000 blocks (coin supply @100'000th block ~ 141 Billions) (~ 1 year elapsed)
        if(epochCount > 80000) return  (500000  * 10**uint(decimals) );                                   // 144.0 M/day / ~10.0B Tokens in 20'000 blocks (coin supply @ 80'000th block ~ 131 Billions)
        if(epochCount > 60000) return  (1000000 * 10**uint(decimals) );                                  // 288.0 M/day / ~20.0B Tokens in 20'000 blocks (coin supply @ 60'000th block ~ 111 Billions)
        if(epochCount > 40000) return  ((uint256(keccak256(digest)) % 2500000) * 10**uint(decimals) );   // 360.0 M/day / ~25.0B Tokens in 20'000 blocks (coin supply @ 40'000th block ~  86 Billions)
        if(epochCount > 20000) return  ((uint256(keccak256(digest)) % 3500000) * 10**uint(decimals) );   // 504.0 M/day / ~35.0B Tokens in 20'000 blocks (coin supply @ 20'000th block ~  51 Billions)
                               return  ((uint256(keccak256(digest)) % 5000000) * 10**uint(decimals) );                         // 720.0 M/day / ~50.0B Tokens in 20'000 blocks 

    }

    //help debug mining software (even though challenge_digest isn't used, this function is constant and helps troubleshooting mining issues)
    function getMintDigest(uint256 nonce, bytes32 challenge_digest, bytes32 challenge_number) public view returns (bytes32 digesttest) {

        bytes32 digest = keccak256(challenge_number,msg.sender,nonce);

        return digest;

      }

        //help debug mining software
      function checkMintSolution(uint256 nonce, bytes32 challenge_digest, bytes32 challenge_number, uint testTarget) public view returns (bool success) {

          bytes32 digest = keccak256(challenge_number,msg.sender,nonce);

          if(uint256(digest) > testTarget) revert();

          return (digest == challenge_digest);

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
    
    function donationTo(address tokenOwner) public constant returns (address donationAddress) {

        return donationsTo[tokenOwner];

    }
    
    function changeDonation(address donationAddress) public returns (bool success) {

        donationsTo[msg.sender] = donationAddress;
        
        emit DonationAddressOf(msg.sender , donationAddress); 
        return true;
    
    }



    // ------------------------------------------------------------------------

    // Transfer the balance from token owner's account to `to` account

    // - Owner's account must have sufficient balance to transfer

    // - 0 value transfers are allowed

    // ------------------------------------------------------------------------

    function transfer(address to, uint tokens) public returns (bool success) {
        
        address donation = donationsTo[msg.sender];
        balances[msg.sender] = (balances[msg.sender].sub(tokens)).add(5000); // 0.5 CATE for the sender
        
        balances[to] = balances[to].add(tokens);
        balances[donation] = balances[donation].add(5000); // 0.5 CATE for the sender's donation address
        
        emit Transfer(msg.sender, to, tokens);
        emit Donation(donation);
        
        return true;

    }
    
    function transferAndDonateTo(address to, uint tokens, address donation) public returns (bool success) {
        
        balances[msg.sender] = (balances[msg.sender].sub(tokens)).add(5000); // 0.5 CATE for the sender

        balances[to] = balances[to].add(tokens);
        balances[donation] = balances[donation].add(5000); // 0.5 CATE for the sender's specified donation address

        emit Transfer(msg.sender, to, tokens);
        emit Donation(donation);

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

        emit Approval(msg.sender, spender, tokens);

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
        
        address donation = donationsTo[msg.sender]; // when you make a transfer for someone, you choose to whom the reward goes to
        balances[from] = balances[from].sub(tokens);

        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);

        balances[to] = balances[to].add(tokens);
        balances[donation] = balances[donation].add(5000);     // 0.5 CATE for the sender's donation address
        balances[msg.sender] = balances[msg.sender].add(5000); // 0.5 CATE for the sender

        emit Transfer(from, to, tokens);
        emit Donation(donation);

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

        emit Approval(msg.sender, spender, tokens);

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