use crate::*;

#[derive(Accounts)]
pub struct SetStage<'info> {
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

impl SetStage<'_> {
    pub fn process_instruction(ctx: Context<Self>, stage: u8) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        //  check stage number is eligible
        require!(stage < NUM_STAGES, PresaleError::PresaleNumberInvalid);

        //  set as next stage
        global_state.stage_iterator = stage;

        Ok(())
    }
}
