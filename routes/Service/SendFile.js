const wchain = require("wchain");
const ReadfileMiddleware = require("../Middlewares/Readfile");
const HashMiddleware = require("../Middlewares/Hash");
const dir = require("./config").dir;

let SendFileChain = wchain();
SendFileChain.use(ReadfileMiddleware(dir, "file"));
SendFileChain.use(HashMiddleware('hex', "hash"));

function SendFile(filename, sendStream, start, end) {//流式发送文件
    let file = {readFrom: filename, start, end};
    let hash = {
        Algs: ['md5', 'sha1'],
        onFinish: (hashs) => {
            //TODO:此处写数据库，注意判断是读取了全部文件还是部分文件，部分文件的hash不可入库
            console.log(hashs);
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
