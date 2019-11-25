const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

function PipeStream(readStream, writeStream) {//将一个读取流pipe到写入流，并计算MD5
    const md5Stream = crypto.createHash('md5');
    md5Stream.setEncoding('base64');
    return new Promise((resolve, reject) => {

        readStream.on('open', function (fd) {
            console.log('stream was opened, fd - ', fd);
        });
        readStream.on('data', function (chunk) {
            console.log('piped %d bytes', chunk.length);
        });
        readStream.on('end', function () {
            console.log('pipe ended');
            return resolve(md5Stream.digest("hex"));
        });

        readStream.on('error', function (err) {
            return reject(err);
        });
        readStream.on('close', function () {
            console.log('pipe closed.');
        });

        readStream.pipe(writeStream);
        readStream.pipe(md5Stream);
    })
}

function dirResolve(filename) {//解决文件目录不存在的问题
    let mkdirs = (p) => {//递归创建文件夹
        let pf = path.dirname(p);//父级文件夹
        if (!fs.existsSync(pf)) mkdirs(pf);//父级不存在就递归
        fs.mkdirSync(p);//父级创建好了再创建子文件夹
    };
    mkdirs(path.dirname(filename));
}

exports.RecvFile = (filename, readStream) => {//流式接收文件
    let fileName = path.join(process.cwd(), filename);
    dirResolve(fileName);
    return new Promise((resolve, reject) => {
        if (fs.existsSync(fileName))
            return reject("接收错误:" + fileName + "已存在");
        let writeStream = fs.createWriteStream(fileName);
        PipeStream(readStream, writeStream)
            .then((md5) => {
                return resolve(md5)
            })
            .catch((err) => {
                return reject(err)
            });
    });
};

exports.SendFile = (filename, writeStream) => {//流式发送文件
    let fileName = path.join(process.cwd(), filename);
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(fileName))
            return reject("发送错误:" + fileName + "不存在");
        let readStream = fs.createReadStream(fileName);
        PipeStream(readStream, writeStream)
            .then((md5) => {
                return resolve(md5)
            })
            .catch((err) => {
                return reject(err)
            });
    });
};
