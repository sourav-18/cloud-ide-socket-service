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

            await S3Controller.downloadS3Folder();
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

        socket.on(socketUtils.on.loadInitialFile, async () => {
            const baseFileData = await fsController.getBaseFileAndDir(constantUtils.key.userLocalWorkspacePath, constantUtils.key.userCodeFilePrefix);
            ioController.emitToUser(socket.id, socketUtils.emit.loadInitialFile, baseFileData);
        })

        socket.on(socketUtils.on.fileContent, async (data) => {
            const prefix = data.prefix;
            const baseFileData = await fsController.getFileContent(constantUtils.key.rootPath + prefix);
            ioController.emitToUser(socket.id, socketUtils.emit.fileContent, baseFileData);
        })
    }

}