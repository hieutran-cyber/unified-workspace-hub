import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    console.log("🚀 Redis connected (PMS)");
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async getAccessCache(userId: string, orgId: string) {
    const key = `user_access:${userId}:${orgId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
}
