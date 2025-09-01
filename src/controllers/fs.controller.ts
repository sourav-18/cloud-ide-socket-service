import PATH from 'path';
import FS from 'fs';

interface FileInfo {
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

    public async getBaseFileAndDir(dirPath: string, userCodeDirPath: string): Promise<FileInfo[] | null> {
        try {
            const entries = await FS.promises.readdir(dirPath, { withFileTypes: true });
            return entries.map((entry) => ({
                name: entry.name,
                type: entry.isDirectory() ? "dir" : "file",
                path: PATH.join(userCodeDirPath, entry.name).replace(/\\/g, "/")
            }));
        } catch (error) {
            console.log("error getBaseFileAndDir: ", error)
            return null;
        }
    }

    public async getFileContent(filePath: string): Promise<Buffer | null> {
         return FS.promises.readFile(PATH.resolve(filePath)).then(data=>data).catch(err=>null)
    }
}

export default fsController.getInstance();