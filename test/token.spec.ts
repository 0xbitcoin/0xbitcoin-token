 
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber, Contract,   Signer, Wallet } from 'ethers'
import hre, { ethers } from 'hardhat'
//import { deploy } from 'helpers/deploy-helpers'
import { XBitcoinTokenTest, XBitcoinTokenUpgrade } from '../generated/typechain'
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
  upgradeTokenContract: XBitcoinTokenUpgrade
}

const setup = deployments.createFixture<SetupReturn, SetupOptions>(
  async (hre, _opts) => {
   
   
    await hre.deployments.fixture(['primary'], {
      keepExistingDeployments: false,
    })

    const originalTokenContract = await hre.contracts.get<XBitcoinTokenTest>('_0xBitcoinTokenTest')
    const upgradeTokenContract = await hre.contracts.get<XBitcoinTokenUpgrade>('_0xBitcoinTokenUpgrade')
   
        
      

    return {
      originalTokenContract,
      upgradeTokenContract
    }
  }
)



describe('Upgrade Contract', () => {

  let originalTokenContract: XBitcoinTokenTest
  let upgradeTokenContract: XBitcoinTokenUpgrade

 
  let miner: Wallet  

  beforeEach(async () => {


    miner = await createAndFundRandomWallet()
   // miner = miner.connect(  ethers.provider )

    const result = await setup()
    originalTokenContract = result.originalTokenContract
    upgradeTokenContract = result.upgradeTokenContract 
 

  })


 

    it('should initialize', async () => { 

       
        let hasInitialized = await upgradeTokenContract.initialized()

        hasInitialized.should.eql(true)
           
 
 
    })

     
  
})
