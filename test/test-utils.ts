import { Wallet } from 'ethers'
import hre, { ethers } from 'hardhat'
import { getFunds } from '../helpers/get-funds'

export async function createAndFundRandomWallet(): Promise<Wallet> {
  const txProvider = ethers.provider

  const wallet = Wallet.createRandom().connect(txProvider)

  await getFunds({
    to: await wallet.getAddress(),
    tokenSym: 'ETH',
    amount: hre.ethers.utils.parseEther('1000'),
    hre,
  })

  return wallet
}