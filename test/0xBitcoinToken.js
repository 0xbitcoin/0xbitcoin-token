var _0xBitcoinToken = artifacts.require("./_0xBitcoinToken.sol");

var ethUtil =  require('ethereumjs-util');
var web3utils =  require('web3-utils');
var solidityHelper =  require('./solidity-helper');



const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

//https://web3js.readthedocs.io/en/1.0/web3-utils.html
//https://medium.com/@valkn0t/3-things-i-learned-this-week-using-solidity-truffle-and-web3-a911c3adc730

contract('_0xBitcoinToken', function(accounts) {


    it("can deploy ", async function () {

      console.log( 'deploying token' )
      var tokenContract = await _0xBitcoinToken.deployed();



  }),




  it("can be minted", async function () {


    await printBalances(accounts)

//canoe

//7.3426930413956622283065143620738574142638959639431768834166324387693517887725e+76)

    var tokenContract = await _0xBitcoinToken.deployed();

    console.log('contract')

    console.log(tokenContract.address)


    //3549073735 ->  0x32f80a141c651deae5d36688163d275858d72e956616d7bcccb21b8869e4da30 ??
    var challenge_number = 3552927407
    var challenge_digest = '0007e4c9ad0890ee34f6d98852d24ce6e9cc6ecfad8f2bd39b7c87b05e8e050b'

    var msg_sender = "0x1234"
//  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(challenge_digest)
//   const phraseDigesttest   = web3utils.sha3(web3utils.toHex(challenge_number), {encoding:"hex"});
  const phraseDigest   = web3utils.soliditySha3( msg_sender , challenge_number )

//   console.log(phraseDigesttest)

//  const phraseDigest = solidityHelper.solidityKeccak256(  challenge_number)

  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(phraseDigest)
  console.log(phraseDigest);  // 0x0007e4c9ad0890ee34f6d98852d24ce6e9cc6ecfad8f2bd39b7c87b05e8e050b
  console.log(challenge_digest);
  console.log(challengeDigestBytes32)

  var mint_tokens = await tokenContract.mint.call(challenge_number,phraseDigest);

   console.log("token mint: " + mint_tokens);


  assert.equal(true, mint_tokens ); //initialized
/*
  assert.equal(10, good_type_record[4].toNumber() ); //check price

  var typeId =  web3utils.toBN(good_type_record[0] );

  console.log("typeId: " + typeId);

  //var result = contract.claimGood(typeId, {value: web3utils.toWei('1')});

  var ethBalance = await web3.eth.getBalance(accounts[0]);
   console.log("Account 0 has " + ethBalance + " Wei");

//console.log( web3utils.toWei('40','ether').toString() );

var result =   await contract.claimGood(  typeId , function(){} ,{ value:web3utils.toWei('0.00001','ether') })

//web3utils.keccak256(typeId + '|' + instanceId)

  var instanceId = 0;
  var token_id = await tokenContract.buildTokenId(typeId,instanceId,function(){})

  var token_record = await tokenContract.tokenOwner(token_id);

    console.log('token record ')
      console.log(token_id)
  console.log(token_record)*/
//  assert.equal(true, result );
//  await contract.claimGood(typeId).send({from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',value: 1000});//,{value: 1000}
//  var token_record = await contract.goods.call(typeId);

//  assert.equal(true, token_record ); //initialized

}),

it("can bid on the market", async function () {

  var tokenContract = await GoodToken.deployed();
  var marketContract = await TokenMarket.deployed();
  var contract = await EtherGoods.deployed();

  await marketContract.setTokenContractAddress(accounts[0],tokenContract);
  await contract.setMarketContractAddress(accounts[0],marketContract);
  await contract.setTokenContractAddress(accounts[0],tokenContract);
  await tokenContract.setMasterContractAddress(accounts[0],contract)





/*

var contract = await EtherGoods.deployed();

  var unique_hash = ethUtil.bufferToHex(ethUtil.sha3("canoeasset"));
  await contract.claimGood(unique_hash);


  var good_record = await contract.goods.call(unique_hash);

  var balance_of = await contract.getSupplyBalance.call(unique_hash,accounts[0]);

    console.log("balance");
    console.log(balance_of);
      console.log(balance_of['c'][0]);

  var balance_of_value = balance_of['c'][0];

  assert.equal(3, balance_of_value );
*/
}),



/*
  it("can not buy a punk with an invalid index", async function () {
      var contract = await CryptoPunksMarket.deployed();
      await expectThrow(contract.claimGood(100000));
    }),
    */

  it("can not get supply while supply all taken", async function () {
      var contract = await EtherGoods.deployed();
      var balance = await contract.balanceOf.call(accounts[0]);
      console.log("Pre Balance: " + balance);

      var allAssigned = await contract.allPunksAssigned.call();
      console.log("All assigned: " + allAssigned);
      assert.equal(false, allAssigned, "allAssigned should be false to start.");
      await expectThrow(contract.getPunk(0));
      var balance = await contract.balanceOf.call(accounts[0]);
      console.log("Balance after fail: " + balance);
    });

/*
  it("should send coin correctly", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

  */
});


async function printBalances(accounts) {
  // accounts.forEach(function(ac, i) {
     var balance_val = await (web3.eth.getBalance(accounts[0]));
     console.log('acct 0 balance', web3utils.fromWei(balance_val.toString() , 'ether') )
  // })
 }
