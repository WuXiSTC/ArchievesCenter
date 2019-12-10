const wchain = require("wchain");
const WritefileMiddleware = require("../Middlewares/Writefile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let RecvFileChain = wchain();
//TODO:此处加秒传
RecvFileChain.use(HashMiddleware("hex", "hash"));
RecvFileChain.use(WritefileMiddleware(dir, "file"));

function RecvFile(filename, recvStream) {//流式接收文件
    let file = {writeTo: filename};
    let hash = {
        Algs: ['md5', 'sha1'],
        onFinish: (hashs) => {
            //TODO:此处写数据库
            console.log(hashs);
        }
    };
    return new Promise((resolve, reject) => {
        RecvFileChain.run({file, hash}, recvStream, () => null, resolve).catch(reject);
    });
}

module.exports = RecvFile;