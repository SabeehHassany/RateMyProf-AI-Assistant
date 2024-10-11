// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign-in form (e.g., "Sign in with...")
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // In a production app, you would validate the username and password against a database
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        
        if (credentials.username === 'user' && credentials.password === 'password') {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  }
});