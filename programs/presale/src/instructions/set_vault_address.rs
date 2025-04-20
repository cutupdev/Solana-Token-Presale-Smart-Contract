use crate::*;
use anchor_spl::{ 
    associated_token::AssociatedToken,
    token::{ Mint, Token, TokenAccount }
};

#[derive(Accounts)]
pub struct SetVaultAddress<'info> {
    #[account(
        mut,
        constraint = global_state.admin == *admin.key @PresaleError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    //  Global state
    #[account(
        mut,
        seeds = [GLOBAL_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,


    /// CHECK: new vault address(multi-sig wallet)
    pub vault: AccountInfo<'info>,


    //  USDC ata of vault
    #[account(
        init_if_needed, 
        payer = admin,
        associated_token::mint = usdc_mint,
        
        //  Authority is set to vault
        associated_token::authority = vault,
    )]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,

    // The mint of $USDC because it's needed from above ⬆ token::mint = ...
    #[account(
        address = USDC_ADDRESS,
    )]
    pub usdc_mint: Account<'info, Mint>,


    //  USDT ata of vault
    #[account(
        init_if_needed, 
        payer = admin,
        associated_token::mint = usdt_mint,
        
        //  Authority is set to vault
        associated_token::authority = vault,
    )]
    pub usdt_vault: Box<Account<'info, TokenAccount>>,

    // The mint of $USDT because it's needed from above ⬆ token::mint = ...
    #[account(
        address = USDT_ADDRESS,
    )]
    pub usdt_mint: Account<'info, Mint>,


    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
}

impl SetVaultAddress<'_> {
    pub fn process_instruction(ctx: Context<Self>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        //  set new vault address
        global_state.vault = ctx.accounts.vault.key();

        Ok(())
    }
}
