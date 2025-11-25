import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthService } from "@mguay/nestjs-better-auth";
import { toNodeHandler } from "better-auth/node";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allows all origins, methods, and headers
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
