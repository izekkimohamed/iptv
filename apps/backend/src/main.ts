import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthService } from "@mguay/nestjs-better-auth";
import { toNodeHandler } from "better-auth/node";
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  // Access Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Access BetterAuth instance from AuthService
  const authService = app.get<AuthService>(AuthService);

  // Mount BetterAuth before body parsers
  expressApp.all(
    /^\/api\/auth\/.*/,
    toNodeHandler(authService.instance.handler)
  );

  // Re-enable Nest's JSON body parser AFTER mounting BetterAuth
  expressApp.use(require("express").json());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
