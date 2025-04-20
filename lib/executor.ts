// Jito Bundling part

import {
    Connection,
    Keypair,
    PublicKey,
    VersionedTransaction,
  } from "@solana/web3.js";
  import base58 from "bs58";
  import {
    SearcherClient,
    searcherClient,
  } from "jito-ts/dist/sdk/block-engine/searcher";
  import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
  import { isError } from "jito-ts/dist/sdk/block-engine/utils";
  
  import dotenv from "dotenv";
  dotenv.config();
  
  const JITO_AUTH_KEYPAIR = process.env.JITO_AUTH_KEYPAIR || "";
  const BLOCK_ENGINE_URL = process.env.BLOCK_ENGINE_URL || "";
  const JITO_FEE = process.env.JITO_FEE || "";
  
  export async function bundle(
    txs: VersionedTransaction[],
    keypair: Keypair,
    connection: Connection
  ) {
    try {
      const txNum = Math.ceil(txs.length / 3);
      let successNum = 0;
  
      for (let i = 0; i < txNum; i++) {
        const upperIndex = (i + 1) * 3;
        const downIndex = i * 3;
        const newTxs = [];
  
        for (let j = downIndex; j < upperIndex; j++) {
          if (txs[j]) newTxs.push(txs[j]);
        }
  
        let success = await bull_dozer(newTxs, keypair, connection);
  
        if (success && success > 0)
          successNum += 1;
      }
  
      return successNum;
    } catch (error) {
      console.log(error);
    }
    return 0;
  }
  
  export async function bull_dozer(
    txs: VersionedTransaction[],
    keypair: Keypair,
    connection: Connection
  ) {
    try {
      // console.log("bull_dozer");
      const bundleTransactionLimit = parseInt("4");
  
      const jito_auth_keypair_array = JITO_AUTH_KEYPAIR.split(",");
      const keyapair_num = Math.floor(
        Math.random() * jito_auth_keypair_array.length
      );
      const jito_auth_keypair = jito_auth_keypair_array[keyapair_num];
      const jitoKey = Keypair.fromSecretKey(base58.decode(jito_auth_keypair));
      // console.log("jitoKey", jitoKey);
  
      const blockengine_url_array = BLOCK_ENGINE_URL.split(",");
      const blockengine_num = Math.floor(
        Math.random() * blockengine_url_array.length
      );
      const blockengine_url = blockengine_url_array[blockengine_num];
      // console.log("blockengine_url", blockengine_url);
      const search = searcherClient(blockengine_url, jitoKey);
  
      const txid = base58.encode(txs[0].signatures[0]);
  
      const ret = await build_bundle(
        search,
        bundleTransactionLimit,
        txs,
        keypair,
        connection
      );
  
      if (ret == null) return 0;
      
      const bundleId = ret
      if(bundleId instanceof Bundle){
        console.log("error getting bundle id")
        return
      }
  
      // const bundle_result = await onBundleResult(search, txid, bundleId, connection);
      // return bundle_result;
  
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  
      const confirmed = await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, "confirmed");
  
      if (confirmed.value.err)
        return 0;
  
      txs.map((tx) => console.log(`TX Confirmed: https://solscan.io/tx/${base58.encode(tx.signatures[0])}`));
      
      return 1;
    } catch (error) {
      console.log(error);
    }
    return 0;
  }
  
  async function build_bundle(
    search: SearcherClient,
    bundleTransactionLimit: number,
    txs: VersionedTransaction[],
    keypair: Keypair,
    connection: Connection
  ) {
    const accounts = await search.getTipAccounts();
    // console.log("tip account:", accounts);
    const _tipAccount =
      accounts[Math.min(Math.floor(Math.random() * accounts.length), 3)];
    const tipAccount = new PublicKey(_tipAccount);
  
    const bund = new Bundle([], bundleTransactionLimit);
    const resp = await connection.getLatestBlockhash("confirmed");
    bund.addTransactions(...txs);
  
    const maybeBundle = bund.addTipTx(
      keypair,
      Number(JITO_FEE),
      tipAccount,
      resp.blockhash
    );
    // console.log({ maybeBundle });
  
    if (isError(maybeBundle)) {
      throw maybeBundle;
    }
  
    try {
      const result = await search.sendBundle(maybeBundle);
  
      console.log(`bundle: https://explorer.jito.wtf/bundle/${result}`);
  
      return result
    } catch (e) {
      console.log(e);
      console.log("error in sending bundle\n");
    }
  
    return maybeBundle;
  }
  
  export const onBundleResult = (
    c: SearcherClient,
    txSig: string,
    targetBundleId: string,
    connection: Connection): Promise<number> => {
  
  
    return new Promise((resolve) => {
  
        let state = 0;
        let isResolved = false;
  
        //tx signature listener plz save my sanity
        let sigSubId = connection.onSignature(txSig, (res) => {
            if (isResolved) {
                connection.removeSignatureListener(sigSubId);
                return;
            }
            if (!res.err) {
                isResolved = true
                console.log(`TX Confirmed: https://solscan.io/tx/${txSig}`);
                resolve(1);
            }
        }, 'confirmed');
  
  
        //SUPER FUCKING BUGGY LISTENER HOLY FUCK I HATE THIS SOO MCUH
        const listener = c.onBundleResult(
            //@ts-ignore
            (result) => {
                if (isResolved) return state;
  
  
                const bundleId = result.bundleId;
                const isAccepted = result.accepted;
                const isRejected = result.rejected;
  
                if (targetBundleId != bundleId) { return 0 }
  
                //if (bundleId == targetBundleId)
  
                    if (isResolved == false) {
  
                        if (isAccepted) {
  
                            console.log("bundle accepted, ID:", bundleId,
                                    " Slot: ", result?.accepted?.slot);
                            state += 1;
                            isResolved = true;
                            resolve(state); // Resolve with 'first' when a bundle is accepted
                            return 0
                        }
  
                        if (isRejected) {
                            console.log('Failed to send Bundle.');
                            isResolved = true;
  
                            if (isRejected.simulationFailure) {
                                if (isRejected.simulationFailure.msg?.toLowerCase().includes('partially') || isRejected.simulationFailure.msg?.toLowerCase().includes('been processed')) {
                                    resolve(1);
                                    return 0
                                }
                                const details = isRejected.simulationFailure.msg ?? '';
                                console.log(details);
                                //addBundleErrorEntry('Simulation Failure', details, { bundleId: bundleId })
                            }
  
                            if (isRejected.internalError) {
                                if (isRejected.internalError.msg?.toLowerCase().includes('partially')) {
                                    resolve(1);
                                    return 0
                                }
                                const details = isRejected.internalError.msg ?? '';
                                console.log(details);
                                //addBundleErrorEntry('Internal Error', details, { bundleId: bundleId })
                            }
  
                            if (isRejected.stateAuctionBidRejected) {
                                if (isRejected.stateAuctionBidRejected.msg?.toLowerCase().includes('partially')) {
                                    resolve(1);
                                    return 0
                                }
                                const details = isRejected.stateAuctionBidRejected.msg ?? '';
                                console.log(details);
                                //addBundleErrorEntry('State Auction Bid Rejected', details, { bundleId: bundleId })
                            }
  
                            if (isRejected.droppedBundle) {
                                if (isRejected.droppedBundle.msg?.toLowerCase().includes('partially') || isRejected.droppedBundle.msg?.toLowerCase().includes('been processed')) {
                                    resolve(1);
                                    return 0
                                }
                                const details = isRejected.droppedBundle.msg ?? '';
                                console.log(details);
                                //addBundleErrorEntry('Dropped Bundle', details, { bundleId: bundleId })
                            }
  
                            if (isRejected.winningBatchBidRejected) {
                                if (isRejected.winningBatchBidRejected.msg?.toLowerCase().includes('partially')) {
                                    resolve(1);
                                    return 0
                                }
                                const details = isRejected.winningBatchBidRejected.msg ?? '';
                                console.log(details);
                                //addBundleErrorEntry('Winning Batch Bid Rejected', details, { bundleId: bundleId })
                            }
                            resolve(state);
                        }
                    }
            },
            (e) => {
                //resolve([state, listener]);
                //console.error(chalk.red(e));
                console.log('error in bundle sub', e);
                resolve(state);
            }
        );
  
        setTimeout(() => {
            resolve(state);
            isResolved = true
        }, 35000);
    });
  };
  
