use crate::*;

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  User pool stores user's buy info
    #[account(
        init,
        space = 8 + std::mem::size_of::<UserState>(),
        seeds = [user.key().as_ref(), USER_SEED.as_ref()],
        bump,
        payer = user
    )]
    pub user_state: Account<'info, UserState>,

    //  Needed to init new account
    pub system_program: Program<'info, System>
}

impl InitUser<'_> {
    pub fn process_instruction(ctx: Context<Self>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;

        user_state.user = ctx.accounts.user.key();

        user_state.tokens = 0;
        user_state.paid_sol = 0;
        user_state.paid_usd = 0;

        Ok(())
    }
}
