import type { RedisClientType } from "redis";
import redisConnection from "./connection.db";
import redisKeys from "./key.db";
import fileUpdateSchema from "./schema/fileUpdate.schema";

class schemaInit {
    private static connInstance: redisConnection = redisConnection.getInstance();
    private static client: RedisClientType = schemaInit.connInstance.getClient();
    private static instance: schemaInit;

    private constructor() {
        this.fileUpdateCreateIndex();
    }

    private async fileUpdateCreateIndex() {
        const fileUpdateKey = redisKeys.index.fileUpdate;
        schemaInit.client.ft.create(`idx:${fileUpdateKey}`, fileUpdateSchema, {
            ON: 'JSON',
            PREFIX: fileUpdateKey + ":"
        }).then().catch(()=>1) // in catch index already exist message come
    }

    public static getInstance(): schemaInit {
        if (!schemaInit.instance) {
            schemaInit.instance = new schemaInit();
        }
        return schemaInit.instance;
    }
    
}

export default schemaInit;