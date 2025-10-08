import { createClient } from "redis";
import type { RedisClientType } from "redis";
import serverEnv from "../../config/serverEnv.config";

class redisConnection {
    private client: RedisClientType;
    private static instance: redisConnection | null = null;

    private constructor() {
        this.client = this.initConnection();
    }

    private initConnection(): RedisClientType {
        const client: RedisClientType = createClient({ url: serverEnv.REDIS_URL });
        client.connect();
        client.on("connect", () => console.log("Redis db connect successfully "))
        client.on("error", (error) => console.log("Redis connection error: ", error))
        return client;
    }

    public static getInstance(): redisConnection {
        if (!redisConnection.instance) {
            redisConnection.instance = new redisConnection();
        }
        return redisConnection.instance;

    }

    public getClient(): RedisClientType {
        return this.client;
    }

}

export default redisConnection;