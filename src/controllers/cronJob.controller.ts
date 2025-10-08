import { CronJob } from 'cron';
import s3Controller from './s3.controller';
import redisFun from '../db/redis/fun.db';
import redisKeys from '../db/redis/key.db';
import constantUtils from '../utils/constant.utils';
import serverEnv from '../config/serverEnv.config';

class cronJob {
    private static instance: cronJob;
    private constructor() {
        this.fileSycToS3();
    }

    private fileSycToS3() {
        CronJob.from({
            cronTime: '*/5 * * * * *',
            onTick: async () => {
                try {
                    const result = await redisFun.indexDataSearch("idx" + ":" + redisKeys.index.fileUpdate, '*');
                    if (!result || !result.documents || result.documents.length === 0) return;
                    for (let item of result.documents) {
                        const filePath = item.id.slice(redisKeys.index.fileUpdate.length + 1);
                        const workspaces = constantUtils.key.userCodeDirName;
                        const workspacesChangePath = filePath.slice(filePath.indexOf(workspaces) + workspaces.length);
                        s3Controller.uploadFile(filePath, serverEnv.S3_USER_FOLDER + workspacesChangePath);
                        redisFun.deleteKey(item.id);
                    }
                } catch (error) {
                    console.log("error :", error)
                }
            },
            start: true,
            timeZone: 'America/Los_Angeles'
        })

        //  console.log("enter")
        // const result = await redisFun.indexDataSearch(redisKeys.index.fileUpdate + ":", '@update:1');
        // console.log(result);
        // const workspaces=constantUtils.key.userCodeDirName;
        // const workspacesChangePath=filePath.slice(filePath.indexOf(workspaces)+workspaces.length);
        // s3Controller.uploadFile(filePath,serverEnv.S3_USER_FOLDER+workspacesChangePath);
    }

    public static getInstance(): cronJob {
        if (!cronJob.instance) {
            cronJob.instance = new cronJob();
        }
        return cronJob.instance;
    }
}

export default cronJob;