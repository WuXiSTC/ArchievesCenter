const wchain = require("wchain");
const ReadfileMiddleware = require("../Middlewares/Readfile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let SendFileChain = wchain();
SendFileChain.use(ReadfileMiddleware(dir, "file"));
SendFileChain.use(HashMiddleware(['md5', 'sha1'], 'hex', "hash"));

const ChecksumSET = require("../Dao/index").ChecksunSET;

function SendFile(filename, sendStream, start, end) {//流式发送文件
    if (start) start = parseInt(start);
    if (end) end = parseInt(end);
    let file = {readFrom: filename, start, end};
    let hash = {
        onFinish: (hashs) => {
            if (!(start || end)) {//部分文件的hash不能入库
                ChecksumSET(hashs, filename)
                    .catch(e => {
                        console.log("数据库写入失败: " + e)
                    });
            }
        }
    };
    return new Promise((resolve, reject) => {
        SendFileChain.run({file, hash}, null,
            (meta, stream) => {
                stream.pipe(sendStream);
            }, resolve).catch(reject);
    });

}

module.exports = SendFile;
