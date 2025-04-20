import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { 
    Connection, 
    Keypair, 
    PublicKey,
    Signer
} from "@solana/web3.js";

export const getAssociatedTokenAccount = (
    ownerPubkey: PublicKey,
    mintPk: PublicKey
): PublicKey => {
    let associatedTokenAccountPubkey = (PublicKey.findProgramAddressSync(
        [
            ownerPubkey.toBytes(),
            TOKEN_PROGRAM_ID.toBytes(),
            mintPk.toBytes(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];

    return associatedTokenAccountPubkey;
}