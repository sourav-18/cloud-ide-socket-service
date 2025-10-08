import { createClient } from "redis";
import type { RedisClientType } from "redis";

class redisConnection {
    private  client: RedisClientType;
    private static instance: redisConnection | null = null;

    private constructor() {
        this.client = this.initConnection();
        redisConnection.instance = new redisConnection();
    }

    private initConnection(): RedisClientType {
        const client: RedisClientType = createClient({ url: "url" });
        client.on("error", (error) => console.log("Redis connection error: ", error.message))
        return client;
    }

    public static getInstance(): redisConnection {
        if (redisConnection.instance) {
            return redisConnection.instance;
        }
        return new redisConnection();
    }

    public getClient(): RedisClientType {
        return this.client;
    }

}

export default redisConnection;