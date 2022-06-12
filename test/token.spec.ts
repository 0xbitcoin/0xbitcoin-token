 
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber, Contract,   Signer, Wallet } from 'ethers'
import hre, { ethers } from 'hardhat'
//import { deploy } from 'helpers/deploy-helpers'
import { XBitcoinTokenTest, XBitcoinTokenV2 } from '../generated/typechain'
import { getPayspecInvoiceUUID, PayspecInvoice , ETH_ADDRESS} from 'payspec-js'
import { deploy } from '../helpers/deploy-helpers'
import { createAndFundRandomWallet } from './test-utils'

chai.should()
chai.use(chaiAsPromised)

const {   deployments } = hre

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SetupOptions {}

interface SetupReturn {
  originalTokenContract: XBitcoinTokenTest
  upgradeTokenContract: XBitcoinTokenV2
}

const setup = deployments.createFixture<SetupReturn, SetupOptions>(
  async (hre, _opts) => {
   
   
    await hre.deployments.fixture(['primary'], {
      keepExistingDeployments: false,
    })

    const originalTokenContract = await hre.contracts
    .get<XBitcoinTokenTest>('_0xBitcoinTokenTest')
    const upgradeTokenContract = await hre.contracts
    .get<XBitcoinTokenV2>('_0xBitcoinTokenV2')
   
        
      

    return {
      originalTokenContract,
      upgradeTokenContract
    }
  }
)



describe('Upgrade Contract', () => {

  let originalTokenContract: XBitcoinTokenTest
  let upgradeTokenContract: XBitcoinTokenV2

 
  let miner: Wallet  

  before(async () => {


    miner = await createAndFundRandomWallet( ethers.provider )

    let minerEth = await miner.getBalance()

   
    const result = await setup()
    originalTokenContract = result.originalTokenContract
    upgradeTokenContract = result.upgradeTokenContract 
 

  })


  

    it('should deposit and withdraw', async () => { 

 
       
      await originalTokenContract.connect(miner).mintTest()
      let balance = await originalTokenContract.balanceOf(miner.address)
 
      expect(balance).to.eql( "5000000000" )

      await originalTokenContract.connect(miner).approveAndCall(upgradeTokenContract.address, 9000, "0x")

      let upgradeBalance = await upgradeTokenContract.balanceOf(miner.address)
 
      expect(upgradeBalance).to.eql( "9000" )

      let depositedAmount = await upgradeTokenContract.amountDeposited( )
 
      expect(depositedAmount).to.eql( "9000" )


      let totalSupply = await upgradeTokenContract.totalSupply( )
 
      expect(totalSupply).to.eql( "2100000000000000" )

      let tokensMinted = await upgradeTokenContract.tokensMinted( )
 
      expect(tokensMinted).to.eql( "30000" )

      expect(await upgradeTokenContract.originalMinedSupply( ))
      .to.eql( "30000" )
 
 

      let latestDiffStartedAt = await upgradeTokenContract.latestDifficultyPeriodStarted( )
      expect(latestDiffStartedAt).to.eql( "1001" )
 


  })

     
  
})
