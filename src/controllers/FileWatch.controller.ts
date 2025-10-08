import chokidar from 'chokidar';
import constantUtils from "../utils/constant.utils";
import s3Controller from './s3.controller';
import serverEnv from "../config/serverEnv.config";

class fileWatchController {
    private static instance: fileWatchController;
    private constructor() {
        this.watchFileChanges();
    }

    public static getInstance(): fileWatchController {
        if (!fileWatchController.instance) {
            fileWatchController.instance = new fileWatchController();
        }
        return fileWatchController.instance;
    }

    private watchFileChanges() {
        chokidar.watch(constantUtils.key.userLocalWorkspacePath, {
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
    }

    private handleFileEvent(filePath: string) {
        console.log("file changed : ", filePath);
        const workspaces="workspaces";
        const workspacesChangePath=filePath.slice(filePath.indexOf(workspaces)+workspaces.length);
        s3Controller.uploadFile(filePath,serverEnv.S3_USER_FOLDER+workspacesChangePath);
    }

    private handleDirEvent(filePath: string) {

    }

    private fileUnlink(filePath: string) {

    }

    private dirUnlink(filePath: string) {

    }
}

export default fileWatchController;