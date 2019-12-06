const wchain = require("../wchain/wchain");
const WritefileMiddleware = require("../Middlewares/Writefile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let RecvFileChain = wchain();
//TODO:此处加秒传
RecvFileChain.use(HashMiddleware("hex", "hash"));
RecvFileChain.use(WritefileMiddleware(dir, "file"));
RecvFileChain.on("error", (e) => {
    throw new Error(e)
});

function RecvFile(filename, recvStream) {//流式接收文件
    return new Promise(async (resolve, reject) => {
        let file = {writeTo: filename};
        let hash = {
            Args: ['md5', 'sha1'],
            onFinish: (hashs) => {
                //TODO:此处写数据库
                resolve(hashs);
                console.log("传输完成" + hashs)
            }
        };
        RecvFileChain.run({file, hash}, recvStream, (stream) => {
            stream.pipe(recvStream);
        });
        try {
            RecvFileChain.run({file, hash}, recvStream);
        } catch (e) {
            reject(e)
        }
    });
}

module.exports = RecvFile;