import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import SessionWrapper from "./SessionWrapper";

const theme = createTheme({});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="auth-layout">
        <MantineProvider theme={theme}>
          <SessionWrapper>
            <main>{children}</main>
          </SessionWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
