
// old
//const NametagToken = artifacts.require("NametagToken");
//const OpenNFTExchange = artifacts.require("OpenNFTExchange");

//https://medium.com/@adrianmcli/migrating-your-truffle-project-to-web3-v1-0-ed3a56f11a4



var EthUtil = require('ethereumjs-util')

// v1.0
const { getWeb3, getContractInstance } = require("./web3helpers")
const web3 = getWeb3()
const getInstance = getContractInstance(web3)

const PayspecHelper = require('./payspec-helper')

var web3utils = web3.utils;



var myAccount;
var counterpartyAccount;
var feeAccount;


contract('payspecV2',(accounts) => {

  var fixedSupplyToken;
  var payspecV2;


  it(" can deploy ", async () => {
    fixedSupplyToken = getInstance("FixedSupplyToken");
    payspecV2 = getInstance("PayspecV2");


    console.log('payspec is ',payspecV2.options.address)


    myAccount = accounts[0];
    counterpartyAccount = accounts[1];
    feeAccount = accounts[2];

      console.log('my acct ', myAccount )
      console.log('counterparty acct ', counterpartyAccount )



  //  await fixedSupplyToken.methods.transfer(counterpartyAccount, 1000000 ).send({from:myAccount})


    assert.ok(fixedSupplyToken);
    assert.ok(payspecV2);
  }),




  it("invoice can be created with proper uuid ", async function () {



  balance = await web3.eth.getBalance(myAccount);
  console.log('eth balance is ', balance)


  let newInvoiceData = {
    description: 'testtx',
    nonce: 1,
    token: fixedSupplyToken.options.address,
    amountDue: 100,
    payTo: myAccount,
    feeAddresses: [ feeAccount ],
    feePercents: [ 2 ],
    expiresAt: 0
  }



  let getInvoiceUUIDArgsArray = Object.values(newInvoiceData)
  let actualInvoiceUUID;

  try {
     actualInvoiceUUID=  await payspecV2.methods.getInvoiceUUID.apply(this,getInvoiceUUIDArgsArray).call({ from: myAccount }) ;
  } catch (error) {
   console.trace(error)
  }


    console.log('actualInvoiceUUID',actualInvoiceUUID)
    assert.ok(actualInvoiceUUID);


    newInvoiceData.payspecContractAddress = payspecV2.options.address

    let expecteduuid = PayspecHelper.getExpectedInvoiceUUID( newInvoiceData )


    assert.equal(expecteduuid, actualInvoiceUUID);




  });



    it("invoice can be submitted ", async function () {




    let newInvoiceData = {
      description: 'testtx2',
      nonce: 2,
      token: fixedSupplyToken.options.address,
      amountDue: 100,
      payTo: counterpartyAccount,
      feeAddresses: [ feeAccount ],
      feePercents: [ 2 ],
      expiresAt: 0
    }

    let getInvoiceUUIDArgsArray = Object.values(newInvoiceData)

    let actualInvoiceUUID;

    try {
       actualInvoiceUUID=  await payspecV2.methods.getInvoiceUUID.apply(this,getInvoiceUUIDArgsArray).call({ from: myAccount }) ;
    } catch (error) {
     console.trace(error)
    }



      //inject the contract address here just to get the expected UUID in an offchain way
      let expecteduuid = PayspecHelper.getExpectedInvoiceUUID( Object.assign( {payspecContractAddress: payspecV2.options.address }, newInvoiceData )  )


      assert.equal( expecteduuid,actualInvoiceUUID );

      let finalInvoiceData = Object.assign(  newInvoiceData, {expecteduuid: expecteduuid } )


      try {
        await fixedSupplyToken.methods.approve(payspecV2.options.address, 10000).send({ from: myAccount, gas:3000000 })
      } catch (error) {
        assert.fail("Method Reverted", "approve",  error.reason);
      }




      let createAndPayArgsArray = Object.values( finalInvoiceData )

        console.log( 'finalInvoiceData', finalInvoiceData  , createAndPayArgsArray)

        let success;

          try {
            success = await payspecV2.methods.createAndPayInvoice.apply(this, createAndPayArgsArray ).send({ from: myAccount, gas:3000000 }) ;
          } catch (error) {
            console.trace( error )
          }


            assert.ok(success);

          let myBalance =   await fixedSupplyToken.methods.balanceOf(myAccount).call( )
          let counterpartyBalance =   await fixedSupplyToken.methods.balanceOf(counterpartyAccount).call( )
          let feeBalance =   await fixedSupplyToken.methods.balanceOf(feeAccount).call( )


            assert.equal(myBalance,2099999999999900);
            assert.equal(counterpartyBalance,98);
            assert.equal(feeBalance,2);

    });




        it("invoice can be cancelled ", async function () {




        let newInvoiceData = {
          description: 'testtx3',
          nonce: 3,
          token: fixedSupplyToken.options.address,
          amountDue: 100,
          payTo: myAccount,
          feeAddresses: [ feeAccount ],
          feePercents: [ 2 ],
          expiresAt: 0
        }

        let getInvoiceUUIDArgsArray = Object.values(newInvoiceData)

        let actualInvoiceUUID;

        try {
           actualInvoiceUUID=  await payspecV2.methods.getInvoiceUUID.apply(this,getInvoiceUUIDArgsArray).call({ from: myAccount }) ;
        } catch (error) {
         console.trace(error)
        }



          //inject the contract address here just to get the expected UUID in an offchain way
          let expecteduuid = PayspecHelper.getExpectedInvoiceUUID( Object.assign( {payspecContractAddress: payspecV2.options.address }, newInvoiceData )  )


          assert.equal( expecteduuid,actualInvoiceUUID );

          let finalInvoiceData = Object.assign(  newInvoiceData, {expecteduuid: expecteduuid } )


          try {
            await fixedSupplyToken.methods.approve(payspecV2.options.address, 10000).send({ from: myAccount, gas:3000000 })
          } catch (error) {
            assert.fail("Method Reverted", "approve",  error.reason);
          }




          let createAndPayArgsArray = Object.values( finalInvoiceData )

            console.log( 'finalInvoiceData', finalInvoiceData  , createAndPayArgsArray)

            let success;

              try {
                success = await payspecV2.methods.cancelInvoice.apply(this, createAndPayArgsArray ).send({ from: myAccount, gas:3000000 }) ;
              } catch (error) {
                console.trace( error )
              }


                assert.ok(success);


        });










});






async function printBalances(accounts) {
  // accounts.forEach(function(ac, i) {
     var balance_val = await (web3.eth.getBalance(accounts[0]));
     console.log('acct 0 balance', web3utils.fromWei(balance_val.toString() , 'ether') )
  // })
 }
