import * as anchor from "@coral-xyz/anchor";
import { 
  Keypair, 
  PublicKey
} from "@solana/web3.js";

import { GLOBAL_SEED, USER_SEED, LAMPORTS_PER_SOL } from "./constant";
import { connection, program, usdcKp, usdtKp, vaultKp } from "./config";
import { createMints } from "./create-mints";
import { airdropToken } from "./airdrop-tokens";
import { getAssociatedTokenAccount } from "./utils";
import { BN } from "bn.js";
import { expect } from 'chai';

describe("presale", () => {

  const adminKp = Keypair.generate();
  const userKp = Keypair.generate();

  console.log("admin: ", adminKp.publicKey.toBase58());
  console.log("user: ", userKp.publicKey.toBase58());

  before(async () => {
    console.log("airdrop SOL to admin")
    const airdropTx = await connection.requestAirdrop(
      adminKp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
    
    console.log("airdrop SOL to user")
    const airdropTx2 = await connection.requestAirdrop(
      userKp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx2);

    console.log("airdrop SOL to vault")
    const airdropTx3 = await connection.requestAirdrop(
      vaultKp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx3);

    console.log("create USDC/USDT");
    await createMints(adminKp);

    console.log("airdrop tokens");
    await airdropToken(usdcKp, usdcKp, adminKp, userKp.publicKey, 1_000_000_000);
    await airdropToken(usdtKp, usdtKp, adminKp, userKp.publicKey, 1_000_000_000);
  });

  it("Is initialized!", async () => {
    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    console.log("globalStateAddr: ", globalStateAddr.toBase58());

    const tx = await program.methods.initialize()
      .accounts({
        admin: adminKp.publicKey,
      })
      .signers([adminKp])
      .rpc();
    console.log("initialize tx: ", tx);

    const globalState = await program.account.globalState.fetch(globalStateAddr);
    const sum = globalState.remainTokens.reduce((acc, num) => acc + num.toNumber(), 0);
    console.log("total tokens needed: ", sum);
  });

  it("Set vault address", async () => {
    const usdcVault = getAssociatedTokenAccount(vaultKp.publicKey, usdcKp.publicKey);
    const usdtVault = getAssociatedTokenAccount(vaultKp.publicKey, usdtKp.publicKey);
    console.log("vault: ", vaultKp.publicKey.toBase58());
    console.log("usdcVault: ", usdcVault.toBase58());
    console.log("usdtVault: ", usdtVault.toBase58());

    const tx = await program.methods.setVaultAddress()
      .accounts({
        admin: adminKp.publicKey,
        vault: vaultKp.publicKey,
        usdcVault,
        usdtVault
      })
      .signers([adminKp])
      .rpc();
    console.log("set dao wallet tx: ", tx);

    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    const globalState = await program.account.globalState.fetch(globalStateAddr);
    console.log("multi-sig wallet addr: ", globalState.vault.toBase58());
  });
  
  it("Start presale", async () => {
    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    
    console.log("globalStateAddr: ", globalStateAddr.toBase58());

    const tx = await program.methods.startPresale()
      .accounts({
        admin: adminKp.publicKey
      })
      .signers([adminKp])
      .rpc();

    console.log("start presale tx: ", tx);

    const globalState = await program.account.globalState.fetch(globalStateAddr);
    expect(globalState.isLive).to.equal(true);
    expect(globalState.stageIterator).to.equal(0);
  });

  it("Admin can set the stage number", async () => {
    
    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    
    const tx = await program.methods.setStage(1)
      .accounts({
        admin: adminKp.publicKey,
      })
      .signers([adminKp])
      .rpc({commitment: "confirmed"});

    console.log("set stage tx: ", tx);
    const globalState = await program.account.globalState.fetch(globalStateAddr, "confirmed");
    expect(globalState.stageIterator).to.equal(1);

    //  set presale stage back to 0
    const tx2 = await program.methods.setStage(0)
    .accounts({
      admin: adminKp.publicKey,
    })
    .signers([adminKp])
    .rpc({commitment: "confirmed"});

    console.log("set stage tx: ", tx2)
  });

  it("Initialize user state", async () => {
    const [userStateAddr, _userIx] = PublicKey.findProgramAddressSync(
      [userKp.publicKey.toBuffer(), Buffer.from(USER_SEED)],
      program.programId
    );
    
    console.log("userStateAddr: ", userStateAddr.toBase58());

    const tx = await program.methods.initUser()
      .accounts({
        user: userKp.publicKey,
        
      })
      .signers([userKp])
      .rpc();

    console.log("init user tx: ", tx);

    const userState = await program.account.userState.fetch(userStateAddr);
    expect(userState).to.not.be.null;
  });

  it("User buys token with SOL", async () => {
    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    const [userStateAddr, _userIx] = PublicKey.findProgramAddressSync(
      [userKp.publicKey.toBuffer(), Buffer.from(USER_SEED)],
      program.programId
    );
    
    console.log("globalStateAddr: ", globalStateAddr.toBase58());
    console.log("userStateAddr: ", userStateAddr.toBase58());

    const userState = await program.account.userState.fetch(userStateAddr, "confirmed");
    const balanceBefore = Number(userState.tokens);

    const buyAmount = 1_000_000_000;  //  1 SOL

    const tx = await program.methods.buy(new BN(buyAmount))
      .accounts({
        user: userKp.publicKey,
        vault: vaultKp.publicKey,
      })
      .signers([userKp])
      .rpc({commitment: "confirmed"});

    console.log("buy with SOL tx: ", tx);

    const userStateAfter = await program.account.userState.fetch(userStateAddr, "confirmed");
    const balanceAfter = Number(userStateAfter.tokens);

    console.log("bought token amout: ", balanceAfter - balanceBefore);
  });
  
  it("User buys token with USDC", async () => {
    const [globalStateAddr, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      program.programId
    );
    const [userStateAddr, _userIx] = PublicKey.findProgramAddressSync(
      [userKp.publicKey.toBuffer(), Buffer.from(USER_SEED)],
      program.programId
    );
    const stableCoinUser = getAssociatedTokenAccount(userKp.publicKey, usdcKp.publicKey);
    const stableCoinVault = getAssociatedTokenAccount(vaultKp.publicKey, usdcKp.publicKey);
    
    console.log("globalStateAddr: ", globalStateAddr.toBase58());
    console.log("stableCoinUser: ", stableCoinUser.toBase58());
    console.log("stableCoinVault: ", stableCoinVault.toBase58());

    const userState = await program.account.userState.fetch(userStateAddr, "confirmed");
    const balanceBefore = Number(userState.tokens);

    const buyAmount = 1_000_000_000;  //  1000 USDC

    const tx = await program.methods.buyWithStableCoin(new BN(buyAmount))
      .accounts({
        user: userKp.publicKey,
        vault: vaultKp.publicKey,
        stableCoin: usdcKp.publicKey,
        stableCoinUser,
        stableCoinVault
      })
      .signers([userKp])
      .rpc({commitment: "confirmed"});

    console.log("buy with USDC tx: ", tx);

    const userStateAfter = await program.account.userState.fetch(userStateAddr, "confirmed");
    const balanceAfter = Number(userStateAfter.tokens);

    console.log("bought token amout: ", balanceAfter - balanceBefore);
  });

  it("Get all user info", async () => {

    const userInfos = await program.account.userState.all();
    console.log(userInfos);
  });

});
