import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.password) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác");
        }

        if (user.status !== "active") {
          throw new Error("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        // Upsert Google user into db
        let dbUser = await db.user.findUnique({
          where: { email: user.email },
          include: { role: true },
        });

        if (!dbUser) {
          // Get user role
          let userRole = await db.role.findUnique({
            where: { name: "user" },
          });

          if (!userRole) {
            userRole = await db.role.create({
              data: {
                name: "user",
                description: "Standard registered customer",
              },
            });
          }

          // Random password for OAuth account
          const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

          dbUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name || "Google User",
              avatar: user.image || "",
              password: randomPassword,
              roleId: userRole.id,
              status: "active",
            },
            include: { role: true },
          });
        }

        user.id = dbUser.id;
        // Bind the role so JWT callback can capture it
        (user as any).role = dbUser.role.name;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.picture = user.image;
      }
      
      // Handle dynamic session updates (e.g. updating profile avatar or name)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.picture) token.picture = session.picture;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-123456789",
};
