import NextAuth, { Session } from 'next-auth';
import Providers from 'next-auth/providers';
import { query as q } from 'faunadb';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user', // define o escopo de permissões de informação do GitHub: https://docs.github.com/pt/developers/apps/scopes-for-oauth-apps
    }),
    // ...add more providers here
  ],
  //   jwt: {
  //     signingKey: process.env.SIGNIN_KEY,
  //   },
  callbacks: {
    async session(session: Session) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
                )
              ),
              q.Match(q.Index('subscription_by_status'), 'active'),
            ])
          )
        );

        return { ...session, activeSubscription: userActiveSubscription };
      } catch {
        return { ...session, activeSubscription: null };
      }
    },
    async signIn(user, account, profile) {
      // console.log(user);
      const { email } = user;

      try {
        // await fauna.query(q.Create(q.Collection('users'), { data: { email } }));
        await fauna.query(
          q.If(
            q.Not(q.Exists(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))),
            q.Create(q.Collection('users'), { data: { email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },

  // A database is optional, but required to persist accounts in a database
  //   database: process.env.DATABASE_URL,
});

// FaunaDB - HTTP -> tem opção para Docker local, pra uso em desenvolvimento e para não ter usar o banco da produção
// DynamoDB - AWS

// PostgresSQL, MongoDb, etc... conexão 24h
