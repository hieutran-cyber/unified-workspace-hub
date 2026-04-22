import { Global, Module } from "@nestjs/common";
import { PrismaClient } from "@kinex/database";

export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
