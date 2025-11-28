import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string(),
      }),
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class AppConfigModule {}
