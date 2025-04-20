# Spl token presale smart contract
This is token presale smart contract. This is full-working project. As a novice of solana smart contract, it might be one of good source code for you. Feel free to reach out of me if you have any question or custom requirements[telegram: https://t.me/DevCutup or whatsapp: https://wa.me/13137423660].


## How to use it

### Install Dependencies

- Install `node` and `yarn`

- Install `rust`, `solana` and `anchor`

    https://www.anchor-lang.com/docs/installation
<br/>

### How to deploy this program?

First of all, you have to clone this repo to your PC.
In the folder `token-presale`

1. Install node modules using `yarn`

2. Build program using anchor cli `anchor build`

3. Get program address using solana cli.

    `solana-keygen pubkey ./target/deploy/presale-keypair.json`
   
   You can get the pubkey of the program. e.g. `BE4G...5qhv`

4. Change program address in the code to `BE4G...5qhv`

   in `lib.rs`
   ```
   declare_id!("BE4G...5qhv");
   ```
   in `Anchor.toml`
   ```
   presale = "BE4G...5qhv"
   ```

5. Change provider settings in `Anchor.toml`
   ```
   cluster = "localnet"
   wallet = "./admin.json"
   ```

6. run `anchor build` again

7. deploy program using anchor cli `anchor deploy`
<br/>

### Test case

./tests/presal.ts is test script for each instruction


run `anchor test` to check test the smart contract

#### Test on devnet

You should build and deploy on devnet first.

Check the program address and USDC, USDT address.

#### - Initialize project

`yarn script init -t <TOKEN_ADDRESS>`

e.g. yarn script init -t 5U6PVxcjCWo361vFwS6cfB65Br4T5jECA6vsVAtm5urt

#### - Set DAO wallet address

`yarn script set-vault -v <DAO_WALLET_ADDRESS>`

e.g. yarn script set-vault -v DJDcV3UxP55KqHUKsTSBve7xssRYtbQ5eSG8uWND2HQ7

#### - Deposit token to the program

`yarn script deposit-token -t <TOKEN_ADDRESS> -a <DEPOSIT_ADMOUNT>`

e.g. yarn script deposit-token -t 5U6PVxcjCWo361vFwS6cfB65Br4T5jECA6vsVAtm5urt -a 200000000000000


#### - Start presale

`yarn script start-presale -t <TOKEN_ADDRESS>`

e.g. yarn script start-presale -t 5U6PVxcjCWo361vFwS6cfB65Br4T5jECA6vsVAtm5urt

#### - Set stage

`yarn script set-stage -s <STAGE_NUMBER>`

e.g. yarn script set-stage -s 1

### Contact Information
- Telegram: https://t.me/DevCutup
- Whatsapp: https://wa.me/13137423660
- Twitter: https://x.com/januscutup
