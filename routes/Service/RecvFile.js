const wchain = require("wchain");
const FastUploadMiddleware = require("../Middlewares/FastUpload");
const WritefileMiddleware = require("../Middlewares/Writefile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let RecvFileChain = wchain();
RecvFileChain.use(FastUploadMiddleware("hash_to_find"));
RecvFileChain.use(HashMiddleware(['md5', 'sha1'], "hex", "hash"));
RecvFileChain.use(WritefileMiddleware(dir, "file"));

const ChecksumSET = require("../Dao/index").ChecksunSET;

function RecvFile(filename, recvStream, hash_to_find) {//流式接收文件
    let file = {writeTo: filename};
    let hash = {
        onFinish: (hashs) => {
            ChecksumSET(hashs, filename)
                .catch(e => {
                    console.log("数据库写入失败: " + e)
                });
        }
    };
    return new Promise((resolve, reject) => {
        RecvFileChain.run({file, hash, hash_to_find}, recvStream, () => null, resolve).catch(reject);
    });
}

module.exports = RecvFile;