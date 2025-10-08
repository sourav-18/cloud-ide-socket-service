import dotenv from "dotenv";
dotenv.config();

const serverEnv = {
    SERVER_PORT: Number(process.env.SERVER_PORT),

    //s3
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_USER_FOLDER: process.env.S3_USER_FOLDER,

    //db
    REDIS_URL:process.env.REDIS_URL
};

export default serverEnv;
