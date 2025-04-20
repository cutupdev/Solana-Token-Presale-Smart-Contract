use crate::*;

#[derive(Accounts)]
pub struct StartPresale<'info> {
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
    pub global_state: Account<'info, GlobalState>
}

impl StartPresale<'_> {
    pub fn process_instruction(ctx: Context<Self>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        //  set is_live and stage_iterator
        global_state.is_live = true;
        global_state.stage_iterator = 0;

        Ok(())
    }
}
