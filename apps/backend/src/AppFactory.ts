import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";
import express, { type Express } from "express";

interface AppFactoryResult {
  app: INestApplication;
  expressApp: Express;
}

export class AppFactory {
  private static app: INestApplication;

  static async create(): Promise<AppFactoryResult> {
    const expressApp: Express = express();
    const adapter = new ExpressAdapter(expressApp);

    this.app = await NestFactory.create(AppModule, adapter);
    this.app.enableCors();
    await this.app.init();

    return {
      app: this.app,
      expressApp,
    };
  }
}
