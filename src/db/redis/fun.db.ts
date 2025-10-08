import redisConnection from "./connection.db";
import type { RedisClientType } from "redis";

class redisFun {
    private static connInstance: redisConnection = redisConnection.getInstance();
    private static client: RedisClientType = redisFun.connInstance.getClient();

    public static async set(key: string, value: string): Promise<boolean> {
        const result = await redisFun.client.set(key, value);
        if (result) return true;
        return false;
    }

    public static async get(key: string): Promise<string | null> {
        const result = await redisFun.client.get(key);
        if (result) return result;
        return null;
    }

    public static async setNx(key: string): Promise<boolean> {
        let result: number = 1;
        while (result) {
            result = await redisFun.client.setNX(key, "ok");
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        return true;
    }
    

}