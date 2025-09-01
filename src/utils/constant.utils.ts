

export default class constantUtils {

    private static staticKey = {
        rootPath: process.cwd(),
        userCodeFilePrefix: '/user-workspaces'
    }

    static key = {
        rootPath: process.cwd(),
        userLocalWorkspacePath: constantUtils.staticKey.rootPath + constantUtils.staticKey.userCodeFilePrefix,
        userCodeFilePrefix: constantUtils.staticKey.userCodeFilePrefix
    }
}