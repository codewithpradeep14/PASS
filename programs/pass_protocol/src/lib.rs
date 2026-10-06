use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Pass111111111111111111111111111111111111111");

pub const PASS_SEED: &[u8] = b"pass";
pub const VAULT_SEED: &[u8] = b"pass_vault";

#[program]
pub mod pass_protocol {
    use super::*;

    /// Initialize and fund a PASS policy account.
    /// The owner deposits `amount` of SPL tokens into the Pass PDA Vault or sets up allowance.
    pub fn create_pass(
        ctx: Context<CreatePass>,
        pass_id: [u8; 16],
        amount: u64,
        max_per_transaction: u64,
        category: u8,
        expires_at: i64,
        purpose_hash: [u8; 32],
        merchant_policy_hash: [u8; 32],
    ) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        require!(amount > 0, PassError::InvalidAmount);
        require!(max_per_transaction > 0, PassError::InvalidAmount);
        require!(max_per_transaction <= amount, PassError::ExceedsMaxPerTx);
        require!(expires_at > current_time, PassError::InvalidExpiration);

        let pass_account = &mut ctx.accounts.pass_account;
        pass_account.owner = ctx.accounts.owner.key();
        pass_account.recipient = ctx.accounts.recipient.key();
        pass_account.mint = ctx.accounts.mint.key();
        pass_account.pass_id = pass_id;
        pass_account.amount = amount;
        pass_account.spent = 0;
        pass_account.max_per_transaction = max_per_transaction;
        pass_account.purpose_hash = purpose_hash;
        pass_account.category = category;
        pass_account.created_at = current_time;
        pass_account.expires_at = expires_at;
        pass_account.status = PassStatus::Active as u8;
        pass_account.merchant_policy_hash = merchant_policy_hash;
        pass_account.bump = ctx.bumps.pass_account;
        pass_account.vault_bump = ctx.bumps.vault_account;

        // Transfer funds from owner token account to the PASS PDA vault account
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.vault_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        emit!(PassCreated {
            pass_account: pass_account.key(),
            owner: pass_account.owner,
            recipient: pass_account.recipient,
            amount,
            category,
            expires_at,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Execute an authorized payment from the PASS vault to the merchant.
    /// Strictly verifies:
    /// 1. Recipient signer
    /// 2. Active status
    /// 3. Not expired
    /// 4. Amount <= max_per_transaction
    /// 5. Amount <= remaining
    /// 6. Category matches
    pub fn execute_payment(
        ctx: Context<ExecutePayment>,
        amount: u64,
        category: u8,
        _merchant: Pubkey,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        let pass_account = &mut ctx.accounts.pass_account;

        // 1. Status verification
        require!(
            pass_account.status == PassStatus::Active as u8,
            PassError::PassInactive
        );

        // 2. Expiration verification
        require!(
            current_time <= pass_account.expires_at,
            PassError::PassExpired
        );

        // 3. Amount positive check
        require!(amount > 0, PassError::InvalidAmount);

        // 4. Per transaction limit check
        require!(
            amount <= pass_account.max_per_transaction,
            PassError::ExceedsMaxPerTx
        );

        // 5. Remaining allowance check
        let remaining = pass_account
            .amount
            .checked_sub(pass_account.spent)
            .ok_or(PassError::ExceedsRemainingBalance)?;
        require!(amount <= remaining, PassError::ExceedsRemainingBalance);

        // 6. Category verification (0 = universal/custom or exact match)
        if pass_account.category != 0 {
            require!(
                pass_account.category == category,
                PassError::CategoryMismatch
            );
        }

        // Transfer from PASS PDA vault to merchant token account using PDA signer
        let pass_id = pass_account.pass_id;
        let owner_key = pass_account.owner;
        let vault_bump = pass_account.vault_bump;

        let seeds = &[
            VAULT_SEED,
            owner_key.as_ref(),
            pass_id.as_ref(),
            &[vault_bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.vault_account.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, amount)?;

        // Update state
        pass_account.spent = pass_account.spent.checked_add(amount).unwrap();
        if pass_account.spent >= pass_account.amount {
            pass_account.status = PassStatus::Depleted as u8;
        }

        emit!(PaymentExecuted {
            pass_account: pass_account.key(),
            owner: pass_account.owner,
            recipient: pass_account.recipient,
            merchant: ctx.accounts.merchant.key(),
            amount,
            category,
            remaining: pass_account.amount.saturating_sub(pass_account.spent),
            timestamp: current_time,
        });

        Ok(())
    }

    /// Owner revokes the PASS.
    /// Remaining unspent funds in the vault are immediately refunded to the owner.
    pub fn revoke_pass(ctx: Context<RevokePass>) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        let pass_account = &mut ctx.accounts.pass_account;

        require!(
            pass_account.status == PassStatus::Active as u8,
            PassError::PassInactive
        );

        let unspent = pass_account
            .amount
            .checked_sub(pass_account.spent)
            .unwrap_or(0);

        if unspent > 0 {
            let pass_id = pass_account.pass_id;
            let owner_key = pass_account.owner;
            let vault_bump = pass_account.vault_bump;

            let seeds = &[
                VAULT_SEED,
                owner_key.as_ref(),
                pass_id.as_ref(),
                &[vault_bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.vault_account.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.vault_account.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer,
            );
            token::transfer(cpi_ctx, unspent)?;
        }

        pass_account.status = PassStatus::Revoked as u8;

        emit!(PassRevoked {
            pass_account: pass_account.key(),
            owner: pass_account.owner,
            refunded_amount: unspent,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Close an expired or revoked PASS account and reclaim lamports rent.
    pub fn close_pass(ctx: Context<ClosePass>) -> Result<()> {
        let pass_account = &ctx.accounts.pass_account;
        require!(
            pass_account.status != PassStatus::Active as u8,
            PassError::CannotCloseActivePass
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(pass_id: [u8; 16])]
pub struct CreatePass<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Recipient pubkey verified by owner choice
    pub recipient: AccountInfo<'info>,

    /// CHECK: SPL Token Mint (e.g. USDC)
    pub mint: AccountInfo<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + PassAccount::LEN,
        seeds = [PASS_SEED, owner.key().as_ref(), pass_id.as_ref()],
        bump
    )]
    pub pass_account: Account<'info, PassAccount>,

    #[account(
        init,
        payer = owner,
        seeds = [VAULT_SEED, owner.key().as_ref(), pass_id.as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault_account
    )]
    pub vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExecutePayment<'info> {
    #[account(
        mut,
        has_one = recipient @ PassError::UnauthorizedRecipient,
        has_one = owner
    )]
    pub pass_account: Account<'info, PassAccount>,

    #[account(mut)]
    pub recipient: Signer<'info>,

    /// CHECK: Destination merchant account
    pub merchant: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, pass_account.owner.as_ref(), pass_account.pass_id.as_ref()],
        bump = pass_account.vault_bump
    )]
    pub vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RevokePass<'info> {
    #[account(
        mut,
        has_one = owner @ PassError::UnauthorizedOwner
    )]
    pub pass_account: Account<'info, PassAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, pass_account.owner.as_ref(), pass_account.pass_id.as_ref()],
        bump = pass_account.vault_bump
    )]
    pub vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClosePass<'info> {
    #[account(
        mut,
        has_one = owner @ PassError::UnauthorizedOwner,
        close = owner
    )]
    pub pass_account: Account<'info, PassAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct PassAccount {
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub pass_id: [u8; 16],
    pub amount: u64,
    pub spent: u64,
    pub max_per_transaction: u64,
    pub purpose_hash: [u8; 32],
    pub category: u8,
    pub created_at: i64,
    pub expires_at: i64,
    pub status: u8,
    pub merchant_policy_hash: [u8; 32],
    pub bump: u8,
    pub vault_bump: u8,
}

impl PassAccount {
    pub const LEN: usize = 32 + // owner
        32 + // recipient
        32 + // mint
        16 + // pass_id
        8 +  // amount
        8 +  // spent
        8 +  // max_per_transaction
        32 + // purpose_hash
        1 +  // category
        8 +  // created_at
        8 +  // expires_at
        1 +  // status
        32 + // merchant_policy_hash
        1 +  // bump
        1;   // vault_bump
}

#[repr(u8)]
pub enum PassStatus {
    Active = 0,
    Revoked = 1,
    Expired = 2,
    Depleted = 3,
}

#[event]
pub struct PassCreated {
    pub pass_account: Pubkey,
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub expires_at: i64,
    pub timestamp: i64,
}

#[event]
pub struct PaymentExecuted {
    pub pass_account: Pubkey,
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub category: u8,
    pub remaining: u64,
    pub timestamp: i64,
}

#[event]
pub struct PassRevoked {
    pub pass_account: Pubkey,
    pub owner: Pubkey,
    pub refunded_amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum PassError {
    #[msg("This PASS is inactive or revoked.")]
    PassInactive,
    #[msg("This PASS has expired.")]
    PassExpired,
    #[msg("Payment amount exceeds maximum allowed per transaction.")]
    ExceedsMaxPerTx,
    #[msg("Payment amount exceeds remaining PASS balance.")]
    ExceedsRemainingBalance,
    #[msg("Merchant category does not match authorized PASS category.")]
    CategoryMismatch,
    #[msg("Signer is not the authorized recipient of this PASS.")]
    UnauthorizedRecipient,
    #[msg("Signer is not the owner of this PASS.")]
    UnauthorizedOwner,
    #[msg("Invalid payment amount.")]
    InvalidAmount,
    #[msg("Invalid expiration timestamp.")]
    InvalidExpiration,
    #[msg("Cannot close an active PASS. Revoke or wait for depletion first.")]
    CannotCloseActivePass,
}
