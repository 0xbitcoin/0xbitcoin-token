import { BigNumber as BN } from 'ethers'
import { ethers } from 'hardhat'

export const isInitialized = async (address: string): Promise<boolean> => {
  const storage = await ethers.provider.getStorageAt(address, 0)
  return !BN.from(storage).isZero()
}
