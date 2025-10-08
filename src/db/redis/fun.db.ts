import redisConnection from "./connection.db";
import { SCHEMA_FIELD_TYPE } from "redis";
import type { RedisClientType } from "redis";

class redisFun {
    private static connInstance: redisConnection = redisConnection.getInstance();
    private static client: RedisClientType = redisFun.connInstance.getClient();

    public static async set(key: string, value: string): Promise<boolean> {
        const result = await redisFun.client.set(key, value);
        if (result) return true;
        return false;
    }

    public static async setEx(key: string, time: number, value: string): Promise<boolean> {
        const result = await redisFun.client.setEx(key, time, value,); //time in second 6 minute (6*60)s=360
        if (result) return true;
        return false;
    }

    public static async get(key: string): Promise<string | null> {
        const result = await redisFun.client.get(key);
        if (result) return result;
        return null;
    }

    public static async setNx(key: string): Promise<boolean> {
        key = key + '-lock';
        let result: number = 1;
        while (result) {
            result = await redisFun.client.setNX(key, "ok");
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        return true;
    }

    public static async releaseLock(key: string): Promise<boolean> {
        key = key + '-lock';
        const result = await redisFun.client.del(key)
        return result ? true : false;
    }

    public static async deleteKey(key: string): Promise<boolean> {
        const result = await redisFun.client.del(key)
        return result ? true : false;
    }

    public static async indexDataSet(key: string, data: any) {
        const result = await redisFun.client.json.set(key, '$', data);
        return result ? true : false;
    }

    public static async indexDataSearch(key: string, field: any) {
        const result = await redisFun.client.ft.search(key, field,{LIMIT:{from:0,size:200}});
        return result;
    }

}

export default redisFun;