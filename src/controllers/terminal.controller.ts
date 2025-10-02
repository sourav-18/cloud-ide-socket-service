import * as pty from "@lydell/node-pty";
import ioController from "./io.controller";
import socketUtils from "../utils/socket.utils";
import constantUtils from "../utils/constant.utils";

class terminalController {
    private session: { terminal: pty.IPty; terminalId: string };
    private static shell = process.platform === "win32" ? "powershell.exe" : "bash";

    public constructor(socketId: string) {
        const terminal=this.createTerminal();
        this.session = { terminal: terminal, terminalId: terminal.pid.toString() };
        this.onData(socketId);
    }

    private createTerminal():pty.IPty {
        return pty.spawn(terminalController.shell, [],
            {
                cols: 100,
                name: "xterm-color",
                cwd: constantUtils.key.userLocalWorkspacePath,
                env: process.env
            }
        );
    }

    public getSession() {
        return this.session;
    }

    private onData(socketId: string) {
        this.session.terminal.onData((data: string) => {
            ioController.emitToUser(socketId, socketUtils.emit.terminalData, data)
        });
    }

    public writeData(data: string) {
        this.session.terminal.write(data);
    }

    public kill() {
        this.session.terminal.kill();
    }
}

export default terminalController;