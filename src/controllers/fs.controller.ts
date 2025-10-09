import PATH from 'path';
import FS from 'fs';
import constantUtils from '../utils/constant.utils';

export interface FileInfo {
    type: "file" | "dir";
    name: string;
    path: string
}

class fsController {
    private static instance: fsController;

    private constructor() {
    }

    public static getInstance(): fsController {
        if (!fsController.instance) {
            fsController.instance = new fsController();
        }
        return fsController.instance;
    }

    public async getBaseFileAndDir(dirPath: string): Promise<FileInfo[] | null> {
        try {
            const entries = await FS.promises.readdir(dirPath, { withFileTypes: true });
            return entries.map((entry) => {
                return {
                    name: entry.name,
                    type: entry.isDirectory() ? "dir" : "file",
                    path: PATH.join(entry.parentPath.slice(constantUtils.key.rootPath.length), entry.name).replace(/\\/g, "/")
                }
            });

        } catch (error) {
            console.log("error getBaseFileAndDir: ", error)
            return null;
        }
    }

    public async getFileContent(filePath: string): Promise<Buffer | null> {
        return FS.promises.readFile(PATH.resolve(filePath)).then(data => data).catch(err => null)
    }

    public async fileContentSync(filePath: string, contentChangeDiff: any): Promise<void> {
        try {
            filePath = PATH.resolve(filePath);
            let oldFileData: string = await FS.promises.readFile(filePath, "utf8");
            let fileData: Array<string> = oldFileData.split("\n");

            const startLine = contentChangeDiff.range.startLineNumber - 1;
            const endLine = contentChangeDiff.range.endLineNumber - 1;
            const startColumn = contentChangeDiff.range.startColumn - 1;
            const endColumn = contentChangeDiff.range.endColumn - 1;

            if (contentChangeDiff.text.length === 0) {
                const deductDeletePart = fileData.splice(startLine, ((endLine - startLine) + 1));
                const startData = deductDeletePart[0].slice(0, startColumn);
                const endData = deductDeletePart[deductDeletePart.length - 1].slice(endColumn);
                const restOfContent = startData + endData;
                if (fileData.length) {
                    fileData.splice(startLine, 0, restOfContent);
                } else {
                    fileData.push(restOfContent);
                }
            } else {
                const startData = fileData[startLine].slice(0, startColumn)
                const endData = fileData[endLine].slice(endColumn)
                const modifyContent = startData + contentChangeDiff.text + endData;
                fileData[startLine] = modifyContent;
            }

            await FS.promises.writeFile(filePath, fileData.join("\n"))

        }
        catch (error) {
            console.log("error fileContentSync: ", error)
            return;
        }
    }

    public async newFileCreate(dirPath: string, fileName: string) {
        try {
            const fullPath = PATH.join(dirPath, fileName)
            if (!FS.existsSync(dirPath) || FS.existsSync(fullPath)) return false;
            await FS.promises.writeFile(fullPath, "");
            return true;
        } catch (error) {
            return false;
        }
    }

    public async newDirCreate(dirPath: string, dirName: string) {
        try {
            const fullPath = PATH.join(dirPath, dirName)
            if (!FS.existsSync(dirPath) || FS.existsSync(fullPath)) return false;
            await FS.promises.mkdir(fullPath);
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    public async removeAllFiles(){
        //todo chokidar stop 
        //todo redis lock delete
        // set when remove file call
        const files=await FS.promises.readdir(PATH.resolve(constantUtils.key.userLocalWorkspacePath));
        for(let item of files){
            const path=PATH.resolve(constantUtils.key.userLocalWorkspacePath,item);
            const stats=await FS.promises.stat(path);
            if(stats.isDirectory()){
                FS.promises.rmdir(path);
            }else{
                FS.promises.unlink(path);
            }
        }
    }


}

export default fsController.getInstance();