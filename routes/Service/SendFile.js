const wchain = require("../wchain/wchain");
const ReadfileMiddleware = require("../Middlewares/Readfile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let SendFileChain = wchain();
SendFileChain.use(ReadfileMiddleware(dir, "file"));
SendFileChain.use(HashMiddleware('hex', "hash"));
SendFileChain.on("error", (e) => {
    throw new Error(e)
});

function SendFile(filename, sendStream, start, end) {//流式发送文件
    return new Promise((resolve, reject) => {
        let file = {readFrom: filename, start, end};
        let hash = {
            Args: ['md5', 'sha1'],
            onFinish: (hashs) => {
                //TODO:此处写数据库
                resolve(hashs);
                console.log("传输完成" + hashs)
            }
        };
        try {
            SendFileChain.run({file, hash}, null, (stream) => {
                stream.pipe(sendStream);
            });
        } catch (e) {
            reject(e)
        }
    });
}

module.exports = SendFile;
