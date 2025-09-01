import AWS from "aws-sdk";
import serverEnv from "../config/serverEnv.config";
import PATH from 'path';
import FS from 'fs';
import constantUtils from "../utils/constant.utils";

interface FileInfo {
    type: "file" | "dir";
    name: string;
    path: string
}

class S3Controller {
    private readonly S3: AWS.S3;
    private static instance: S3Controller;

    private constructor() {
        this.S3 = this.initS3();
    }

    private initS3(): AWS.S3 {
        return new AWS.S3({
            endpoint: serverEnv.AWS_ENDPOINT,
            accessKeyId: serverEnv.AWS_ACCESS_KEY_ID,
            secretAccessKey: serverEnv.AWS_SECRET_ACCESS_KEY
        });
    }

    public async downloadS3Folder() {
        try {
            const bucket = serverEnv.S3_BUCKET_NAME!;
            const prefix = serverEnv.S3_USER_FOLDER!;
            //Todo here if folder exists in local don't download again
            const response = await this.S3.listObjectsV2({
                Bucket: bucket,
                Prefix: prefix
            }).promise();

            if (!response.Contents) return;

            await Promise.all(response.Contents.map(async (item) => {
                const fileKey = item.Key;
                if (!fileKey) return;

                const objectData = await this.S3.getObject({
                    Bucket: bucket,
                    Key: fileKey
                }).promise();

                const relativePath = fileKey.replace(prefix, "");
                const localFilePath = PATH.join(constantUtils.key.userLocalWorkspacePath, relativePath);
                let isEmptyDir = await this.crateEmptyDir(localFilePath);
                if (isEmptyDir === false)
                    await this.writeFile(localFilePath, objectData.Body as Buffer)
            }))

        } catch (error) {
            console.log("error download s3 folder : ", error)
        }
    }

    private async crateEmptyDir(dirPath: string): Promise<Boolean> {
        if (dirPath.endsWith('\\')) {
            await FS.promises.mkdir(dirPath, { recursive: true });
            return true;
        }
        return false;
    }

    private async writeFile(filePath: string, fileData: Buffer): Promise<void> {
        await FS.promises.writeFile(filePath, fileData);
    }

    public static getInstance(): S3Controller {

        if (!S3Controller.instance) {
            S3Controller.instance = new S3Controller();
        }
        return S3Controller.instance;
    }

}

export default S3Controller.getInstance();





