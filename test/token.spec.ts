 
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber, Contract,   Signer, Wallet } from 'ethers'
import hre, { ethers } from 'hardhat'
//import { deploy } from 'helpers/deploy-helpers'
import { XBitcoinTokenTest, XBitsToken } from '../generated/typechain'
import { getPayspecInvoiceUUID, PayspecInvoice , ETH_ADDRESS} from 'payspec-js'
import { deploy } from '../helpers/deploy-helpers'
import { createAndFundRandomWallet } from './test-utils'
import { ApprovalInputs, DomainData, signPermitApproval } from './lib/EIP2616SDK'

chai.should()
chai.use(chaiAsPromised)

const {   deployments } = hre

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SetupOptions {}

interface SetupReturn {
  originalTokenContract: XBitcoinTokenTest
  upgradeTokenContract: XBitsToken
}

const setup = deployments.createFixture<SetupReturn, SetupOptions>(
  async (hre, _opts) => {
   
   
    await hre.deployments.fixture(['primary'], {
      keepExistingDeployments: false,
    })

    const originalTokenContract = await hre.contracts
    .get<XBitcoinTokenTest>('_0xBitcoinTokenTest')
    const upgradeTokenContract = await hre.contracts
    .get<XBitsToken>('xBitsToken')
   
        
      

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
  let permitter: Wallet  

  before(async () => {


    miner = await createAndFundRandomWallet( ethers.provider )
    permitter = await createAndFundRandomWallet( ethers.provider )

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

   
      expect(await upgradeTokenContract.currentMiningReward( ))
      .to.eql( "5000000000" )
 
 

      let latestDiffStartedAt = await upgradeTokenContract.latestDifficultyPeriodStarted( )
      expect(latestDiffStartedAt).to.eql( "1001" )
 


  })

  it('should permit approve', async () => { 

    
   

    let permitNonce = await upgradeTokenContract.nonces( miner.address )
    expect(permitNonce).to.eql(0)

    let permitNonceString = permitNonce.toString()

    let approvalInputs :ApprovalInputs = {

      spender: miner.address,
      value: '10',
      deadline:  (Date.now() + 80000).toString(),
      permitNonce: permitNonceString

    } 

    let ethersNetwork = await ethers.provider.getNetwork()

     
    let domainData : DomainData = {
      name: await upgradeTokenContract.name(),
      version: await upgradeTokenContract.version(),
      chainId: ethersNetwork.chainId,
      resolverAddress: upgradeTokenContract.address
    }
 
    let permitInputs = await signPermitApproval( 
      approvalInputs, domainData, permitter  )
 
    
    await upgradeTokenContract.connect(miner).permit(
      permitInputs.owner,
      permitInputs.spender,
      permitInputs.value,
      permitInputs.deadline,
      permitInputs.v,
      permitInputs.r,
      permitInputs.s 
      ) 
     

  })

     
  
})
