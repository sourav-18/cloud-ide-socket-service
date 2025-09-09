import { Server, Socket } from "socket.io";
import { Server as HttpServer } from 'node:http';
import socketUtils from "./utils/socket.utils";
import S3Controller from "./controllers/s3.controller";
import constantUtils from "./utils/constant.utils";
import fsController from "./controllers/fs.controller";
import ioController from "./controllers/io.controller";

export default class SocketServer {
    private static instance: SocketServer;
    private io: Server;


    public constructor(httpServer: HttpServer) {
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
            console.log('a user connected');

            // await S3Controller.downloadS3Folder();
            this.ioHandler(socket);
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });

    }

    private ioHandler(socket: Socket) {
        socket.on(socketUtils.on.ping, () => {
            socket.emit(socketUtils.emit.pong, 'pong');
        });

        const workspacePrefix = constantUtils.key.userCodeFilePrefix;
        ioController.emitToUser(socket.id, socketUtils.emit.initialDirPath, {
            dirPath: workspacePrefix,
            filePath: "/workspaces/index.js"
        });


        socket.on(socketUtils.on.fileContent, async (data) => {
            const filePath = data.filePath;
            const baseFileData = await fsController.getFileContent(constantUtils.key.getFullPath(filePath));
            ioController.emitToUser(socket.id, socketUtils.emit.fileContent, baseFileData);
        })

        socket.on(socketUtils.on.dirBaseFile, async (data, callback) => {
            const dirPath = data.dirPath;
            const baseFiles = await fsController.getBaseFileAndDir(constantUtils.key.getFullPath(dirPath));
            ioController.callbackSend(callback, {
                baseFiles: baseFiles,
                dirPath: dirPath
            })
        })

        socket.on(socketUtils.on.fileContentSync, async (data) => {
            const filePath = constantUtils.key.getFullPath(data.filePath);
            console.log(data.changes)
            for (let change of data.changes) {
                await fsController.fileContentSync(filePath, change)
            }
        })

        socket.on(socketUtils.on.newFileCreate, async (data) => {
            const dirFullPath = constantUtils.key.getFullPath(data.dirPath);
            const response = await fsController.newFileCreate(dirFullPath, data.fileName);
            console.log(response)

        })
    }

}