export default class socketUtils {
    static emit = {
        pong: "pong",
        loadInitialFile: "on:file:load-initial-file",
        fileContent: "on:file:content"
    }

    static on = {
        ping: "ping",
        loadInitialFile: "file:load-initial-file",
        fileContent: "file:content"
    }
}
