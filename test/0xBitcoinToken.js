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


    var challenge_number = await tokenContract.getChallengeNumber.call( );
    console.log('challenge_number',challenge_number)

  //  challenge_number = '0x513d3339b587b62e4ea2b9d2762113a245f9fdad264d37bcc6829ce66bd4d456';

     var nonce = 2969915614
    var challenge_digest = '0000609b4446d74fe8a356c13f833752c688fc4ffa7537de0f6613248fed90d5'


    var msg_sender = accounts[0]
//  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(challenge_digest)
//   const phraseDigesttest   = web3utils.sha3(web3utils.toHex(challenge_number), {encoding:"hex"});
  const phraseDigest = web3utils.soliditySha3(challenge_number, '0x0529dccdd203181e4e19f3ca28a7cf5790267cfd', nonce )

//  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(phraseDigest)
  console.log(phraseDigest);  // 0x0007e4c9ad0890ee34f6d98852d24ce6e9cc6ecfad8f2bd39b7c87b05e8e050b
  console.log(challenge_digest);
  console.log(nonce)



  var mint_tokens = await tokenContract.mint.call(nonce,phraseDigest, {from: '0x0529dccdd203181e4e19f3ca28a7cf5790267cfd'});

 


   console.log("token mint: " + mint_tokens);


  assert.equal(true, mint_tokens ); //initialized


});
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


/*
it("can bid on the market", async function () {

  var tokenContract = await GoodToken.deployed();
  var marketContract = await TokenMarket.deployed();
  var contract = await EtherGoods.deployed();

  await marketContract.setTokenContractAddress(accounts[0],tokenContract);
  await contract.setMarketContractAddress(accounts[0],marketContract);
  await contract.setTokenContractAddress(accounts[0],tokenContract);
  await tokenContract.setMasterContractAddress(accounts[0],contract)





}),




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



  */
});


async function printBalances(accounts) {
  // accounts.forEach(function(ac, i) {
     var balance_val = await (web3.eth.getBalance(accounts[0]));
     console.log('acct 0 balance', web3utils.fromWei(balance_val.toString() , 'ether') )
  // })
 }
