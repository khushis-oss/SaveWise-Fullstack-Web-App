export function generateVerificationOtp() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  return {
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000 ),
  };
}