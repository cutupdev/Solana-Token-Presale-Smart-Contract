import { usdcKp, connection } from "./config";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { 
    Connection,
    Signer,
    PublicKey,
    Keypair
} from "@solana/web3.js";

export const airdropToken = async (mintKp: Keypair, authority: Keypair, payer: Signer, user: PublicKey, amount: number) => {
    const userAta = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintKp.publicKey,
        user
    );

    await mintTo(
        connection,
        payer,
        mintKp.publicKey,
        userAta.address,
        authority,
        amount,
        []
    );

    const balance = (await connection.getTokenAccountBalance(userAta.address)).value.amount;
    console.log(`minted - address: ${mintKp.publicKey.toBase58()} amount: ${balance} to: ${user.toBase58()}`);
}
