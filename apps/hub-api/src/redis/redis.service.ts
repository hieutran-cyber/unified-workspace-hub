import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    console.log("🚀 Redis connected");
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setAccessCache(userId: string, orgId: string, data: any) {
    const key = `user_access:${userId}:${orgId}`;
    // Store for 1 hour
    await this.client.set(key, JSON.stringify(data), "EX", 3600);
  }

  async getAccessCache(userId: string, orgId: string) {
    const key = `user_access:${userId}:${orgId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteAccessCache(userId: string, orgId: string) {
    const key = `user_access:${userId}:${orgId}`;
    await this.client.del(key);
  }

  async invalidateUserCache(userId: string) {
    // Optional: scan and delete all org caches for this user
    const keys = await this.client.keys(`user_access:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}
