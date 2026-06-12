export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout p-4">
      <main>{children}</main>
    </div>
  );
}
