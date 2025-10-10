import chokidar from 'chokidar';
import type {FSWatcher} from "chokidar";
import constantUtils from "../utils/constant.utils";
import s3Controller from './s3.controller';
import serverEnv from "../config/serverEnv.config";
import redisFun from '../db/redis/fun.db';
import redisKeys from '../db/redis/key.db';

class fileWatchController {
    private static instance: fileWatchController;
    private chokidar:FSWatcher;
    private constructor() {
        this.chokidar=this.watchFileChanges();
    }

    public static getInstance(): fileWatchController {
        if (!fileWatchController.instance) {
            fileWatchController.instance = new fileWatchController();
        }
        return fileWatchController.instance;
    }

    private watchFileChanges():FSWatcher {
        this.chokidar=chokidar.watch(constantUtils.key.userLocalWorkspacePath, {
            // persistent: true,
            ignoreInitial: true,
            depth: 99
        })
            .on('add', (filePath) => this.handleFileEvent(filePath))
            .on('change', (filePath) => this.handleFileEvent(filePath))
            .on('unlink', (filePath) => this.fileUnlink(filePath))
            .on('addDir', (dirPath) => this.handleDirEvent(dirPath))
            .on('unlinkDir', (dirPath) => this.dirUnlink(dirPath))
            .on('error', (error) => console.log(`Watcher error: ${error}`))
            .on('ready', () => console.log('Initial scan complete. Ready for changes'));
        return this.chokidar;
    }

    private async handleFileEvent(filePath: string) {
        console.log("enter------------------")
        await redisFun.indexDataSet(redisKeys.index.getKey(redisKeys.index.fileUpdate, filePath), { update: 1 })
        // const workspaces="workspaces";
        // const workspacesChangePath=filePath.slice(filePath.indexOf(workspaces)+workspaces.length);
        // s3Controller.uploadFile(filePath,serverEnv.S3_USER_FOLDER+workspacesChangePath);
    }

    private handleDirEvent(filePath: string) {

    }

    private fileUnlink(filePath: string) {
        console.log("unlink file: ",filePath)
    }

    private dirUnlink(filePath: string) {
        console.log("unlink dir: ",filePath)
    }

    public async stopWatcher(){
        this.chokidar.close();
    }

    
}

export default fileWatchController;