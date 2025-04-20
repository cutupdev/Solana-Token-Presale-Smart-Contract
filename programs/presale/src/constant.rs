use solana_program::{pubkey, pubkey::Pubkey};

//  seeds
pub const GLOBAL_SEED: &[u8] = b"presale-global";
pub const USER_SEED: &[u8] = b"presale-user";

//  address of stable coins
// pub const USDC_ADDRESS: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
// pub const USDT_ADDRESS: Pubkey = pubkey!("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");

//  test addresses
pub const USDC_ADDRESS: Pubkey = pubkey!("usdRLypwfSeEUw4DhUcscCcju6zzBviXymFBRjcBXTw");
pub const USDT_ADDRESS: Pubkey = pubkey!("usderEuWoVkjMcc3bEYkGopx78La8mHzt6YGdmErrpz");

pub const NUM_STAGES: u8 = 10;

//  stage data: stage_num, price, amounts
pub struct Stage {
    pub index: u8,
    pub price: u64,
    pub amount: u64,
}

pub const STAGES: [Stage; 10] = [
    Stage { index: 1,  price: 2_000_000, amount:  2_500_000 },
    Stage { index: 2,  price: 3_000_000, amount:  2_500_000 },
    Stage { index: 3,  price: 4_000_000, amount:  6_250_000 },
    Stage { index: 4,  price: 5_000_000, amount: 27_500_000 },
    Stage { index: 5,  price: 5_500_000, amount: 37_500_000 },
    Stage { index: 6,  price: 6_000_000, amount: 41_250_000 },
    Stage { index: 7,  price: 6_500_000, amount: 37_500_000 },
    Stage { index: 8,  price: 7_000_000, amount: 35_000_000 },
    Stage { index: 9,  price: 8_000_000, amount:  7_500_000 },
    Stage { index: 10, price: 9_000_000, amount:  2_500_000 },
];

pub const TOKEN_DECIMALS: u64 = 1_000_000;

//  pyth price feed on solana mainnet-beta
pub const SOL_USD_FEED: Pubkey = pubkey!("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
pub const STALENESS_THRESHOLD: u64 = 60; // staleness threshold in seconds
