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
            Algs: ['md5', 'sha1'],
            onFinish: (hashs) => {
                //TODO:此处写数据库，注意判断是读取了全部文件还是部分文件，部分文件的hash不可入库
                resolve(hashs);
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
