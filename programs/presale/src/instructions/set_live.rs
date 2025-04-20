use crate::*;

#[derive(Accounts)]
pub struct SetLive<'info> {
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
}

impl SetLive<'_> {
    pub fn process_instruction(ctx: Context<Self>, live: bool) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        //  set is_live as live
        global_state.is_live = live;

        Ok(())
    }
}
