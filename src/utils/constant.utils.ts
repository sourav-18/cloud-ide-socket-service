

export default class constantUtils {

    private static staticKey = {
        rootPath: process.cwd(),
        userCodeFilePrefix: '/workspaces'
    }

    static key = {
        rootPath: constantUtils.staticKey.rootPath,
        userLocalWorkspacePath: constantUtils.staticKey.rootPath + constantUtils.staticKey.userCodeFilePrefix,
        userCodeFilePrefix: constantUtils.staticKey.userCodeFilePrefix,
        getFullPath:(prefix:string):string=>constantUtils.staticKey.rootPath+prefix
    }
}