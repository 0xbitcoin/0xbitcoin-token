import { BigNumber, BigNumberish, Signer } from 'ethers'
import { IUniswapV2Router, IWETH } from 'generated/typechain'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ADDRESSES } from '../helpers/consts'
import { Address, TokenSymbol } from '../helpers/types'

import { getTokens, isEthereumNetwork } from '../config'

export interface SwapArgs {
  to: Address | Signer
  tokenSym: TokenSymbol
  amount: BigNumberish
  hre: HardhatRuntimeEnvironment
}

export const getFunds = async (args: SwapArgs): Promise<void> => {
  const { getNamedSigner, ethers, contracts, network } = args.hre

  const forkingNetworkName = process.env.FORKING_NETWORK
  const funder = await getNamedSigner('funder')
  //const { all: tokenAddresses } = getTokens(args.hre.network)

  let routerAddress: string
   
  const toAddress = Signer.isSigner(args.to)
    ? await args.to.getAddress()
    : args.to

  if (args.tokenSym === 'ETH' || args.tokenSym === 'MATIC') {   
    await funder.sendTransaction({
      to: toAddress,
      value: args.amount,
    })
  } 
}

export interface SendNativeTokenArgs {
  tokenAddress: string
  amount: BigNumberish
  toAddress: string
  hre: HardhatRuntimeEnvironment
}

const sendWrappedNativeToken = async (
  args: SendNativeTokenArgs
): Promise<BigNumber> => {
  const funder = await args.hre.getNamedSigner('funder')
  const weth = await args.hre.contracts.get<IWETH>('IWETH', {
    at: args.tokenAddress,
    from: funder,
  })
  const balanceToSend = args.hre.ethers.BigNumber.from(args.amount).mul(2)
  await weth.deposit({ value: balanceToSend, from: funder.getAddress() })
  await weth.transfer(args.toAddress, args.amount, {
    from: funder.getAddress(),
  })
  return await weth.balanceOf(args.toAddress)
}
