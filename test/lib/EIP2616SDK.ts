import { Wallet,  utils } from "ethers";


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

    let output: PermitApproval 

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
    console.log('domainSeparator',utils.keccak256(domainSeparator))

    let permitTypehash = utils.keccak256(utils.toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"))
        
    let owner = permitter.address

    let typeHashAndData = abiCoder.encode(
        ["bytes32","address","address","uint","uint","uint"],
        [
        permitTypehash,
        owner,
        approvalInputs.spender,
        approvalInputs.value,
        approvalInputs.permitNonce + 1 ,
        approvalInputs.deadline]
    );

    console.log('utils.keccak256(typeHashAndData)',utils.keccak256(typeHashAndData))

    let digest = utils.solidityKeccak256(
         ["bytes2","bytes32","bytes32"], [   
        Buffer.from('1901', 'hex'),
        utils.keccak256(domainSeparator), //correct
        utils.keccak256(typeHashAndData) //correct 
     ]
         )


    /*let digest = utils.keccak256(
        utils.solidityPack( ["bytes","bytes32","bytes32"], [   
            Buffer.from('1901', 'hex'),
            utils.keccak256(domainSeparator),
            utils.keccak256(typeHashAndData) ]
        )
    );*/
   console.log('cDigest', digest )  //this is correct 

    let msgHash =  (utils.arrayify(digest));


    console.log('signer address is ', permitter.address )

    let flatSig = await permitter.signMessage(msgHash)
 
  
            //this is acting the same as the contract 
    let pubKey = utils.recoverPublicKey(msgHash, flatSig);
    let recAddress = utils.computeAddress(pubKey)
    console.log('recAddress',recAddress)

      
    // For Solidity, we need the expanded-format of a signature
    let sig = utils.splitSignature(flatSig);



    /*
     bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(REVOKE_TYPEHASH, uuid, _nonces[attester]++)
                )
            )
        );
    */
    
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