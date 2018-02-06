var _0xBitcoinToken = artifacts.require("./_0xBitcoinToken.sol");

var ethUtil =  require('ethereumjs-util');
var web3utils =  require('web3-utils');
var solidityHelper =  require('./solidity-helper');

var miningHelper =  require('./mining-helper');
var networkInterfaceHelper =  require('./network-interface-helper');


const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

//https://web3js.readthedocs.io/en/1.0/web3-utils.html
//https://medium.com/@valkn0t/3-things-i-learned-this-week-using-solidity-truffle-and-web3-a911c3adc730



//Test _reAdjustDifficulty
//Test rewards decreasing


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


  //  challenge_number = '0x513d3339b587b62e4ea2b9d2762113a245f9fdad264d37bcc6829ce66bd4d456';

    challenge_number = '0x085078f6e3066836445e800334b4186d99567065512edfe78fa7a4f611d51c3d'

     var solution_number = 1185888746
    var solution_digest = '0x000016d56489592359ce8e8b61ec335aeb7b7dd5695da22e25ab2039e02c8976'

    var from_address = '0x2B63dB710e35b0C4261b1Aa4fAe441276bfeb971';

    var targetString = await tokenContract.getMiningTarget.call({from: from_address});
    var target = web3utils.toBN(targetString);

    console.log('target',target)

    var msg_sender = accounts[0]
//  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(challenge_digest)
//   const phraseDigesttest   = web3utils.sha3(web3utils.toHex(challenge_number), {encoding:"hex"});
  const phraseDigest = web3utils.soliditySha3(challenge_number, from_address, solution_number )

//  var challengeDigestBytes32 = solidityHelper.stringToSolidityBytes32(phraseDigest)
  console.log('phraseDigest', phraseDigest);  // 0x0007e4c9ad0890ee34f6d98852d24ce6e9cc6ecfad8f2bd39b7c87b05e8e050b
  console.log(solution_digest);
  console.log(solution_number)


  var checkDigest = await tokenContract.getMintDigest.call(solution_number,phraseDigest,challenge_number, {from: from_address});

  console.log('checkDigest',checkDigest)

  console.log('target',target)

  console.log('challenge_number',challenge_number)

  //var checkSuccess = await tokenContract.checkMintSolution.call(solution_number,phraseDigest,challenge_number, target );
  //  console.log('checkSuccess',checkSuccess)

//  var mint_tokens = await tokenContract.mint.call(solution_number,phraseDigest, {from: from_address});

  // console.log("token mint: " + mint_tokens);


//  assert.equal(true, mint_tokens ); //initialized

});


it("can be mined", async function () {


  await printBalances(accounts)


  var tokenContract = await _0xBitcoinToken.deployed();

  console.log('contract')

  console.log(tokenContract.address)

  var test_account= {
      'address': '0x087964cd8b33ea47c01fbe48b70113ce93481e01',
      'privateKey': 'dca672104f895219692175d87b04483d31f53af8caad1d7348d269b35e21c3df'
  }


//  var msg_sender = accounts[0]


      networkInterfaceHelper.init(web3,tokenContract,test_account);
      miningHelper.init(web3,tokenContract,test_account,networkInterfaceHelper);


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
