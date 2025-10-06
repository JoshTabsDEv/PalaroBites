import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createSupabaseServerClient} from '@/lib/supabase';

const supabase = createSupabaseServerClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter(supabase),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/login', // Your login route
  },
});

export { auth as GET, auth as POST } from '@/auth';