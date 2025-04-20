use crate::*;
use anchor_spl::{ 
    associated_token::AssociatedToken,
    token::{ Mint, Token, TokenAccount }
};

#[derive(Accounts)]
pub struct BuyWithStableCoin<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    //  Global state
    #[account(
        mut,
        seeds = [GLOBAL_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    //  User pool stores user's buy info
    #[account(
        mut,
        seeds = [user.key().as_ref(), USER_SEED.as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,

    
    /// CHECK: vault address(multi-sig wallet)
    pub vault: AccountInfo<'info>,

    
    //  stable coin ata of user
    #[account(
        mut,
        associated_token::mint = stable_coin,
        associated_token::authority = user,
    )]
    pub stable_coin_user: Box<Account<'info, TokenAccount>>,

    //  stable coin ata of vault
    #[account(
        mut,
        associated_token::mint = stable_coin,
        associated_token::authority = vault,
    )]
    pub stable_coin_vault: Box<Account<'info, TokenAccount>>,

    //  token address of stable coin(USDC/USDT)
    /// CHECK: 
    pub stable_coin: Account<'info, Mint>,


    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl BuyWithStableCoin<'_> {
    pub fn process_instruction(ctx: Context<Self>, mut stable_coin_amount: u64) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let stage_iterator = global_state.stage_iterator;

        //  check presale is live
        if global_state.is_live == false {
            match stage_iterator {
                0 => return Err(error!(PresaleError::PresaleNotStarted)),
                stage if stage > NUM_STAGES => return Err(error!(PresaleError::PresaleEnded)),
                _ => return Err(error!(PresaleError::PresalePaused)),
            }
        }


        //  check stable coin address
        require!(ctx.accounts.stable_coin.key() == USDC_ADDRESS || ctx.accounts.stable_coin.key() == USDT_ADDRESS, PresaleError::InvalidStableToken);

        //  calculate token amount from stable_coin_amount and token price
        let mut token_amount = stable_coin_amount / STAGES[stage_iterator as usize].price;
        msg!("token amount: {}", token_amount);


        //  check if enough token remain
        if global_state.remain_tokens[stage_iterator as usize] < token_amount {
            //  fix token_amount and stable_coin_amount
            token_amount = global_state.remain_tokens[stage_iterator as usize];
            stable_coin_amount = STAGES[stage_iterator as usize].price * token_amount;

            //  go to next stage
            global_state.stage_iterator = stage_iterator + 1;

            //  end presale if current stage is the last one
            if stage_iterator == NUM_STAGES {
                global_state.is_live = false;
            }
        }


        //  minus remain tokens in the current stage
        global_state.remain_tokens[stage_iterator as usize] -= token_amount;

        //  add total tokens sold
        global_state.token_sold += token_amount;

        //  add total USD received
        global_state.token_sold_usd += stable_coin_amount;

        //  add user info
        let user_state = &mut ctx.accounts.user_state;
        user_state.tokens += token_amount;
        user_state.paid_usd += stable_coin_amount;

        //  transfer stable coin to vault
        token_transfer_user(
            ctx.accounts.stable_coin_user.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.stable_coin_vault.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            stable_coin_amount,
        )
        
    }
}
