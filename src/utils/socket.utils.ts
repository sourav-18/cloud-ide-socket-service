export default class socketUtils {
    static emit = {
        pong: "pong",
        // loadInitialFile: "on:dir:load-initial-file",
        fileContent: "on:file:content",
        dirBaseFile: "on:dir:base-file",
        initialDirPath: "on:dir:initial-path",
        terminalData: "on:terminal:data"
    }

    static on = {
        ping: "ping",
        // loadInitialFile: "dir:load-initial-file",
        fileContent: "file:content",
        newFileCreate: "file:new-create",
        newDirCreate: "dir:new-create",
        dirBaseFile: "dir:base-file",
        fileContentSync: "file:content-sync",
        initialDirPath: "on:dir:initial-path",
        terminalRequest: "terminal:request",
        terminalWrite: "terminal:write"

    }
}
