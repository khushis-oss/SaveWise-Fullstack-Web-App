import NextAuth, { type AuthOptions } from "next-auth";
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
        if (!credentials?.email) return null;

        // Token already fetched by handleSubmit — verify it locally, no second backend call
        if (credentials.backendToken && credentials.userId && process.env.JWT_SECRET) {
          try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(credentials.backendToken, secret);
            if (payload.userId === credentials.userId) {
              return {
                id: credentials.userId,
                email: credentials.email,
                name: credentials.name ?? null,
                image: credentials.image ?? null,
              };
            }
          } catch {
            return null;
          }
        }

        // Fallback: standard email/password flow (used if signIn is called directly)
        if (!credentials.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.user._id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.profilePictureUrl,
          };
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/`;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const res = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              imageUrl: user.image,
              role: "User",
            }),
          });
          if (!res.ok && res.status !== 400) {
            console.error("Failed to persist OAuth user, status:", res.status);
          }
        } catch (err) {
          console.error("Failed to persist OAuth user:", err);
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
