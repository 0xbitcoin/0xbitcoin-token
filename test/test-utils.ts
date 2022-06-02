import { Provider } from '@ethersproject/abstract-provider'
import { Wallet } from 'ethers'
import hre, { ethers } from 'hardhat'
import { getFunds } from '../helpers/get-funds'

export async function createAndFundRandomWallet(provider: any): Promise<Wallet> {
 

  const wallet = Wallet.createRandom().connect(provider)

  await getFunds({
    to: await wallet.getAddress(),
    tokenSym: 'ETH',
    amount: hre.ethers.utils.parseEther('1000'),
    hre,
  })

  return wallet
}