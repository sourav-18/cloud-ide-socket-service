import { Server, Socket } from "socket.io";
import { Server as HttpServer } from 'node:http';
import socketUtils from "./utils/socket.utils";
import S3Controller from "./controllers/s3.controller";
import constantUtils from "./utils/constant.utils";
import fsController from "./controllers/fs.controller";
import ioController from "./controllers/io.controller";
import terminalController from "./controllers/terminal.controller";
import serverEnv from "./config/serverEnv.config";
import FileWatchController from './controllers/FileWatch.controller';
import redisFun from "./db/redis/fun.db";
import redisKeys from "./db/redis/key.db";



export default class SocketServer {
    private terminals: { [terminalId: string]: { terminalObj: terminalController } } = {};
    private io: Server;


    public constructor(httpServer: HttpServer) {
        // fsController.removeAllFiles() //why chokidar not showing rmove file
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        new ioController(this.io);
        this.connectionHandler();
    }

    private connectionHandler() {
        this.io.on('connection', async (socket) => {
            console.log('a user connected ', socket.id);
            const isUserFileExist = await redisFun.get(redisKeys.key.isUserFileExist);
            if (!isUserFileExist) {
                await redisFun.set(redisKeys.key.isUserFileExist, "true");
                await S3Controller.downloadS3Folder();
                console.log("file download complete")
            }
            FileWatchController.getInstance();
            this.ioHandler(socket);
            socket.on('disconnect', () => {
                fsController.removeAllFiles() //todo not every disconnect delete file 
                this.clearTerminals();
                console.log('user disconnected ', socket.id);
            });
        });

    }



    private ioHandler(socket: Socket) {
        socket.on(socketUtils.on.ping, () => {
            socket.emit(socketUtils.emit.pong, 'pong');
        });

        ioController.emitToUser(socket.id, socketUtils.emit.initialFileLoadComplete, true);


        const workspacePrefix = constantUtils.key.userCodeFilePrefix;

        setTimeout(() => {
            ioController.emitToUser(socket.id, socketUtils.emit.initialDirPath, {
                filePath: "/workspaces/index.js",
                dirPath: workspacePrefix,
                rootDirData: {
                    name: "workspaces",
                    path: workspacePrefix,
                    type: "dir"
                }
            });
        }, 10)




        socket.on(socketUtils.on.fileContent, async (data) => {
            const filePath = data.filePath;
            const baseFileData = await fsController.getFileContent(constantUtils.key.getFullPath(filePath));
            ioController.emitToUser(socket.id, socketUtils.emit.fileContent, baseFileData);
        })

        socket.on(socketUtils.on.dirBaseFile, async (data, callback) => {
            if (typeof callback !== "function") {
                return;
            }
            const dirPath = data.dirPath;
            const baseFiles = await fsController.getBaseFileAndDir(constantUtils.key.getFullPath(dirPath));
            ioController.callbackSend(callback, {
                baseFiles: baseFiles,
                dirPath: dirPath
            })
        })

        socket.on(socketUtils.on.fileContentSync, async (data) => {
            const filePath = constantUtils.key.getFullPath(data.filePath);
            for (let change of data.changes) {
                await fsController.fileContentSync(filePath, change)
            }
        })

        socket.on(socketUtils.on.newFileCreate, async (data, callback) => {
            if (typeof callback !== "function") {
                return;
            }
            const dirFullPath = constantUtils.key.getFullPath(data.dirPath);
            let response: boolean | Object = await fsController.newFileCreate(dirFullPath, data.fileName);
            if (response) {
                response = {
                    name: data.fileName,
                    path: data.dirPath + "/" + data.fileName,
                    type: "file"
                }
            }
            ioController.callbackSend(callback, response);
        })

        socket.on(socketUtils.on.newDirCreate, async (data, callback) => {
            if (typeof callback !== "function") {
                return;
            }
            const dirFullPath = constantUtils.key.getFullPath(data.dirPath);
            let response: boolean | Object = await fsController.newDirCreate(dirFullPath, data.dirName);
            if (response) {
                response = {
                    name: data.dirName,
                    path: data.dirPath + "/" + data.dirName,
                    type: "dir"
                }
            }
            ioController.callbackSend(callback, response);
        })

        //terminal

        socket.on(socketUtils.on.terminalRequest, (data, callback) => {
            const terminalObj = new terminalController(socket.id);
            const session = terminalObj.getSession();
            this.terminals[session.terminalId] = { terminalObj: terminalObj };
            ioController.callbackSend(callback, { terminalId: session.terminalId });
        })

        socket.on(socketUtils.on.terminalWrite, (data) => {
            this.terminals[data.terminalId]?.terminalObj.writeData(data.data)
        })


    }

    private clearTerminals() {
        Object.keys(this.terminals).forEach(terminalId => {
            this.terminals[terminalId].terminalObj.kill();
            delete this.terminals[terminalId];
        })
    }

}