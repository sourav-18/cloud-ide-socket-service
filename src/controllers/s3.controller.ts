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
                Prefix: prefix,
            }).promise();



            if (!response.Contents) return;
            const dirList = [];
            const fileList = [];

            for (let item of response.Contents) {
                if (item.Key?.endsWith('//') || item.Key?.endsWith('/')) {
                    dirList.push(item);
                } else {
                    fileList.push(item);
                }
            }

            await Promise.all(dirList.map(async (item) => {
                const fileKey = item?.Key;
                if (!fileKey) return;
                const relativePath = fileKey.replace(prefix, "");
                if(relativePath.length==0||relativePath==='/')return;
                const localFilePath = PATH.join(constantUtils.key.userLocalWorkspacePath, relativePath);
                await this.crateEmptyDirInLocal(localFilePath);
            }))

            await Promise.all(fileList.map(async (item) => {
                const fileKey = item.Key;
                if (!fileKey) return;

                const objectData = await this.S3.getObject({
                    Bucket: bucket,
                    Key: fileKey
                }).promise();

                const relativePath = fileKey.replace(prefix, "");
                if(relativePath.length==0||relativePath==='/')return;
                const localFilePath = PATH.join(constantUtils.key.userLocalWorkspacePath, relativePath);
                await this.writeFile(localFilePath, objectData.Body as Buffer)
            }))

        } catch (error) {
            console.log("error download s3 folder : ", error)
        }
    }

    private async crateEmptyDirInLocal(dirPath: string): Promise<Boolean> {
        await FS.promises.mkdir(dirPath, { recursive: true });
        return true;
    }

    private async writeFile(filePath: string, fileData: Buffer): Promise<void> {
        await FS.promises.writeFile(filePath, fileData);
        // try {
        //     await FS.promises.writeFile(filePath, fileData);
        // } catch (error:any) {
        //     console.log("error: ", filePath, error.message)
        // }
    }

    public uploadFile(localFilePath: string, fileS3Path: string) {
        fileS3Path = fileS3Path.replaceAll("\\", "/")
        const fileContent = FS.createReadStream(localFilePath);
        const params = {
            Bucket: serverEnv.S3_BUCKET_NAME!,
            Key: fileS3Path, // File name you want to save as in S3
            Body: fileContent
        };

        this.S3.putObject(params, (err, data) => {
            if (err) {
                // console.error("Error uploading file: ", err);
            } else {
                // console.log("File uploaded successfully: ", data);
            }
        });

    }

    public uploadEmptyDir(filePath: string) {
        const workspaces = constantUtils.key.userCodeDirName;
        let fileS3Path = filePath.slice(filePath.indexOf(workspaces) + workspaces.length);
        fileS3Path = serverEnv.S3_USER_FOLDER + fileS3Path.replaceAll("\\", "/") + '/';
        const params = {
            Bucket: serverEnv.S3_BUCKET_NAME!,
            Key: fileS3Path, // File name you want to save as in S3
        };

        this.S3.putObject(params, (err, data) => {
            if (err) {
                console.error("Error uploadEmptyDir file: ", err);
            } else {
                console.log("File uploaded successfully: ", data);
            }
        });
    }

    public static getInstance(): S3Controller {

        if (!S3Controller.instance) {
            S3Controller.instance = new S3Controller();
        }
        return S3Controller.instance;
    }

}

export default S3Controller.getInstance();





