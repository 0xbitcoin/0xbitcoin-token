import { DeployFunction } from 'hardhat-deploy/types'

import { deploy } from '../helpers/deploy-helpers'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { getTokens, getNetworkName} from '../config'
import { ethers } from 'hardhat'

const deployOptions: DeployFunction = async (hre) => {
  const {  run, network } = hre
 
  // Make sure contracts are compiled
  await run('compile')

  console.log('')
  console.log('********** Deploying **********', { indent: 1 })
  console.log('')
 

   
  const originalToken = await deploy({
    contract: '_0xBitcoinTokenTest',
    args: [ ],
    skipIfAlreadyDeployed: false,
    hre, 
  })

  const upgradeToken = await deploy({
    contract: 'xBitsToken',
    args: [ originalToken.address ],
    skipIfAlreadyDeployed: false,
    hre, 
  })



}

deployOptions.tags = ['primary']
deployOptions.dependencies = []

export default deployOptions
