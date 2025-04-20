use crate::*;

#[error_code]
pub enum PresaleError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,

    #[msg("Token address dismatch")]
    InvalidToken,

    #[msg("Token amount is not enough for all stages")]
    NotEnoughToken,

    #[msg("Presale number is not correct")]
    PresaleNumberInvalid,
    
    #[msg("Presale is not started")]
    PresaleNotStarted,
    
    #[msg("Presale is ended")]
    PresaleEnded,
    
    #[msg("Presale is paused")]
    PresalePaused,
    
    #[msg("Pyth feed address is not right")]
    InvalidPriceFeed,
    
    #[msg("Stable token address is not right")]
    InvalidStableToken,
}
