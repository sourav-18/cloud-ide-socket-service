export default class redisKeys {
    static key = {
        user:"user",
        isUserFileExist:"user-file-exits"
    }
    static index={
        fileUpdate:"fileUpdate",
        getKey:(prefix:string,key:string)=>{
            return prefix+":"+key;
        }
    }
}