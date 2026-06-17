export function generateVerificationOtp() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  return {
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000 ),
  };
}

export function generateAccountNumber(): string {
  return Math.floor(
    1000000000 + Math.random() * 9000000000
  ).toString();
}

export const CustomEvents= {
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGED_IN:"user_logges_in",
  CONTRIBUTION_MADE:"contribution_made",
  ALLOCATED_FUNDS:"allocated_funds"
}