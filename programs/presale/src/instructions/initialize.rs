use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    //  Global state
    #[account(
        init,
        space = 8 + std::mem::size_of::<GlobalState>(),
        seeds = [GLOBAL_SEED],
        bump,
        payer = admin
    )]
    pub global_state: Account<'info, GlobalState>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
}

impl Initialize<'_> {
    pub fn process_instruction(ctx: Context<Self>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        msg!("{}", global_state.key());

        //  initialize global state
        global_state.admin = ctx.accounts.admin.key();
        global_state.vault = Pubkey::default();

        global_state.token_sold = 0;
        global_state.token_sold_usd = 0;
        
        global_state.is_live = false;

        global_state.stage_iterator = 0;

        
        global_state.remain_tokens = [0; NUM_STAGES as usize];

        // Update remain_tokens from STAGES
        global_state.update_remain_tokens();

        Ok(())
    }
}
