import { BN, Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram
} from "@solana/web3.js";

import {
  getAssociatedTokenAccount
} from "./util";
import { GLOBAL_STATE_SEED, USDC_ADDRESS, USDT_ADDRESS } from "./constant";
import { Presale } from "../target/types/presale";

export const createInitializeTx = async (
  admin: PublicKey,
  token: PublicKey,
  program: Program<Presale>
) => {
  const [globalState, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    program.programId
  );
  console.log("globalState: ", globalState.toBase58());

  const tokenVault = getAssociatedTokenAccount(globalState, token);
  console.log("tokenVault: ", tokenVault.toBase58());

  const tx = new Transaction();

  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }))
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 65_000 }))
    .add(
      await program.methods
        .initialize()
        .accounts({
          admin,
          token,
          tokenVault
        })
        .transaction()
    );

  tx.feePayer = admin;

  return tx;
};

export const createSetVaultAddressTx = async (
  admin: PublicKey,
  vault: PublicKey,
  program: Program<Presale>
) => {
  const [globalState, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    program.programId
  );
  console.log("globalState: ", globalState.toBase58());

  const usdcVault = getAssociatedTokenAccount(vault, USDC_ADDRESS);
  console.log("usdcVault: ", usdcVault.toBase58());

  const usdtVault = getAssociatedTokenAccount(vault, USDT_ADDRESS);
  console.log("usdtVault: ", usdtVault.toBase58());

  const tx = new Transaction();

  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }))
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 120_000 }))
    .add(
      await program.methods
        .setVaultAddress()
        .accounts({
          admin,
          vault,
          usdcVault,
          usdtVault
        })
        .transaction()
    );

  tx.feePayer = admin;

  return tx;
};

export const createDepositPresaleToken = async (
  admin: PublicKey,
  token: PublicKey,
  amount: number,
  program: Program<Presale>
) => {
  const [globalState, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    program.programId
  );
  console.log("globalState: ", globalState.toBase58());

  const tokenAdmin = getAssociatedTokenAccount(admin, token);
  console.log("tokenAdmin: ", tokenAdmin.toBase58());

  const tokenVault = getAssociatedTokenAccount(globalState, token);
  console.log("tokenVault: ", tokenVault.toBase58());

  const tx = new Transaction();

  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }))
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 65_000 }))
    .add(
      await program.methods
        .depositPresaleToken(new BN(amount))
        .accounts({
          admin,
          token,
          tokenAdmin,
          tokenVault
        })
        .transaction()
    );

  tx.feePayer = admin;

  return tx;
};

export const createStartPresaleTx = async (
  admin: PublicKey,
  token: PublicKey,
  program: Program<Presale>
) => {
  const [globalState, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_STATE_SEED)],
    program.programId
  );
  console.log("globalState: ", globalState.toBase58());

  const tokenVault = getAssociatedTokenAccount(globalState, token);
  console.log("tokenVault: ", tokenVault.toBase58());

  const tx = new Transaction();

  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }))
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 65_000 }))
    .add(
      await program.methods
        .startPresale()
        .accounts({
          admin,
          token,
          tokenVault
        })
        .transaction()
    );

  tx.feePayer = admin;

  return tx;
};

export const createSetStageTx = async (
  admin: PublicKey,
  stageNum: number,
  program: Program<Presale>
) => {

  const tx = new Transaction();

  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }))
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 65_000 }))
    .add(
      await program.methods
        .setStage(stageNum)
        .accounts({
          admin
        })
        .transaction()
    );

  tx.feePayer = admin;

  return tx;
};
