import { 
    Connection, 
    Keypair, 
    PublicKey ,
    Signer
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import { connection, usdcKp, usdtKp } from "./config";

export const createMints = async (payer: Keypair) => {

    //  create USDC account if it's not exist
    
    let usdcInfo = await connection.getAccountInfo(usdcKp.publicKey);
    if (!usdcInfo) {
        await createMintAcct(
            usdcKp,
            payer,
            usdcKp.publicKey
        );

        console.log(`created USDC address: ${usdcKp.publicKey.toBase58()}`);
    } else {
        console.log(`exist USDC address: ${usdcKp.publicKey.toBase58()}`);
    }

    //  create USDT account if it's not exist
    
    let usdtInfo = await connection.getAccountInfo(usdtKp.publicKey);
    if (!usdtInfo) {
        await createMintAcct(
            usdtKp,
            payer,
            usdtKp.publicKey
        );

        console.log(`created USDT address: ${usdtKp.publicKey.toBase58()}`);
    } else {
        console.log(`exist USDT address: ${usdtKp.publicKey.toBase58()}`);
    }
}

const createMintAcct = async (mintKp: Keypair, payer: Signer, authorityToAssign: PublicKey): Promise<PublicKey> => {
    return await createMint(
        connection,
        payer, // payer
        authorityToAssign, // mint authority
        null, // freeze authority
        6, // decimals
        mintKp // address of the mint
    );
}
