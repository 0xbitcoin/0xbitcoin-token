import { Wallet,  utils } from "ethers";
import ethUtil, { bufferToHex, ecrecover, ecsign, pubToAddress, toBuffer } from 'ethereumjs-util'

export interface PermitApproval{

    owner: string,
    spender: string,
    value: string,
    deadline: string,
    v: number,
    r: string,
    s: string 

}

export interface ApprovalInputs {
    spender: string,
    value: string,
    deadline: string,
    permitNonce: string
}

export interface DomainData {
    name: string,
    version: string,
    chainId: number,
    resolverAddress: string 
}

export async function signPermitApproval( 
    approvalInputs: ApprovalInputs,
    domainData: DomainData, 
    permitter: Wallet
    ) : Promise<PermitApproval>{
 

    let abiCoder = new utils.AbiCoder()

    let domainString = utils.keccak256(utils.toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"))

    let domainSeparator = abiCoder.encode(
        ["bytes32","bytes32","bytes32","uint","address"],
        [
        domainString,
        utils.keccak256(utils.toUtf8Bytes(domainData.name)),
        utils.keccak256(utils.toUtf8Bytes(domainData.version)),
        domainData.chainId,
        domainData.resolverAddress]
    ) 
    
    let permitTypehash = utils.keccak256(utils.toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"))
        
    let owner = permitter.address

    let typeHashAndData = abiCoder.encode(
        ["bytes32","address","address","uint","uint","uint"],
        [
        permitTypehash,
        owner,
        approvalInputs.spender,
        approvalInputs.value,
        approvalInputs.permitNonce   ,
        approvalInputs.deadline]
    );

   
    let digest = utils.solidityKeccak256(
         ["bytes2","bytes32","bytes32"], [   
        Buffer.from('1901', 'hex'),
        utils.keccak256(domainSeparator), //correct
        utils.keccak256(typeHashAndData) //correct 
     ]) 


   var msgBuffer= toBuffer(digest)

   const sig = ecsign(msgBuffer, toBuffer(permitter.privateKey))
   
   var hashBuf = toBuffer(digest)

   const pubKey  = ecrecover(hashBuf, sig.v, sig.r, sig.s);
   const addrBuf = pubToAddress(pubKey);
   const recoveredSignatureSigner = bufferToHex(addrBuf);
 
    
    return  {
        owner,
        spender: approvalInputs.spender,
        value: approvalInputs.value,
        deadline: approvalInputs.deadline,
        v: sig.v,
        r: sig.r,
        s: sig.s
    }     
}