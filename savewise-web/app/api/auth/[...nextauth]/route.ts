import NextAuth, { type AuthOptions, type User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        backendToken: { label: "Backend Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        name: { label: "Name", type: "text" },
        image: { label: "Image", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.backendToken || !credentials?.userId || !process.env.JWT_SECRET) {
          return null;
        }

        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET);
          const { payload } = await jwtVerify(credentials.backendToken, secret);
          if (payload.userId !== credentials.userId) return null;

          return {
            id: credentials.userId,
            email: credentials.email,
            name: credentials.name ?? null,
            image: credentials.image ?? null,
            backendToken: credentials.backendToken,
          } as User & { backendToken: string };
        } catch {
          return null;
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user?.backendToken) {
        token.backendToken = user.backendToken;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.backendToken = token.backendToken ?? null;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/`;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          let userData;
          const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              imageUrl: user.image,
              role: "User",
            }),
          });

          if (signupRes.ok) {
            const data = await signupRes.json();
            userData = data.user;
          } else if (signupRes.status === 400) {
            // User already exists — generate a fresh OTP via login
            const loginRes = await fetch(`${API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email }),
            });
            if (!loginRes.ok) return false;
            const loginData = await loginRes.json();
            userData = loginData.user;
          } else {
            console.error("Failed to persist OAuth user, status:", signupRes.status);
            return false;
          }

          // Redirect to verify page — returning a URL denies the NextAuth session
          // so VerifyCode will establish it via signIn("credentials") after OTP check
          return `/auth/verify?user=${encodeURIComponent(JSON.stringify(userData))}`;
        } catch (err) {
          console.error("Failed to persist OAuth user:", err);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
