import { Server, Socket } from "socket.io";

export default class ioController {
    private static io: Server;

    public constructor(io: Server) {
        ioController.io = io;
    }

    public static emitToUser(socketId: string, event: string, data: any) {
        this.io.to(socketId).emit(event,
            {
                status: "success",
                statusCode: 200,
                data: data
            }
        );
    }

    public static callbackSend(callback:Function, data:any) {
        callback(
            {
                status: "success",
                statusCode: 200,
                data: data
            }
        );
    }

}