import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js'

export interface GlobalState {
    admin: PublicKey,
    vault: PublicKey,
    token: PublicKey,
    totalAmount: anchor.BN,
    tokenSold: anchor.BN,
    tokenSoldUsd: anchor.BN,
    isLive: Boolean,
    stageIterator: number,
    remainTokens: anchor.BN[]
}
