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