import * as dotenv from "dotenv";
import * as path from "path";

import * as fs from "fs";

// Load .env from root or current dir
let currentPath = process.cwd();
while (currentPath !== "/") {
  const envPath = path.join(currentPath, ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    console.log(`✅ Loaded .env from: ${envPath} (Overridden)`);
    break;
  }
  currentPath = path.dirname(currentPath);
}

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend
  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  console.log(`🚀 Hub API is running on: http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
