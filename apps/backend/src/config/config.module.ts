import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        BETTER_AUTH_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(4000),
      }),
      validationOptions: { abortEarly: true },
    }),
  ],
})
export class AppConfigModule {}
