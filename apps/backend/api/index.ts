import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";

let cachedApp: any; // prevent re-creating Nest app on every invocation

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    cachedApp = app.getHttpAdapter().getInstance();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return cachedApp(req, res);
}
