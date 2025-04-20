use crate::*;

#[derive(Accounts)]
pub struct ChangeAdmin<'info> {
    // Current admin
    #[account(
        mut,
        constraint = global_state.admin == *admin.key @PresaleError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    //  Stores admin address
    #[account(
        mut,
        seeds = [GLOBAL_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
}

pub fn process_change_admin(ctx: Context<ChangeAdmin>, new_admin: Pubkey) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;

    // Don't need check admin since it signed the transaction
    global_state.admin = new_admin;

    Ok(())
}
