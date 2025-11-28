import { AuthModule as NestAuthModule } from '@mguay/nestjs-better-auth';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database-connection';

@Module({
  imports: [
    ConfigModule,
    NestAuthModule.forRootAsync({
      useFactory: (db: NodePgDatabase) => ({
        auth: betterAuth({
          database: drizzleAdapter(db, { provider: 'pg' }),
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
          },
          emailAndPassword: { enabled: false }, // Google only
          secret: process.env.BETTER_AUTH_SECRET!,
          trustedOrigins: ['http://localhost:3000'],
        }),
      }),
      inject: [DATABASE_CONNECTION],
    }),
  ],

  exports: [NestAuthModule],
})
export class AuthModule {}
