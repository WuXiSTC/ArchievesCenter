const fs = require("fs");
const path = require("path");
const dir = require("./config").dir;
const Dao = require("../Dao/index");
const pathStats = Dao.pathStats;
const valid_filename = Dao.valid_filename;
const dirResolve = Dao.dirResolve;
const PipeStream = Dao.PipeStream;


async function RecvFile(filename, readStream) {//流式接收文件
    if (!valid_filename(filename)) throw new Error("非法路径名:" + filename);
    let fileName = path.join(dir, filename);
    await dirResolve(fileName);
    let stats = await pathStats(fileName);//检查文件是否存在
    if (stats !== null)//存在则报错
        throw new Error("文件" + fileName + "已存在");

    return new Promise(async (resolve, reject) => {
        //不存在才能写入
        let writeStream = fs.createWriteStream(fileName);
        PipeStream(readStream, writeStream, ['md5', 'sha1', 'sha256', 'sha512'])
            .then((hashs) => {
                return resolve(hashs)//返回值为各类hash值
            })
            .catch((err) => {
                return reject(err)
            });
    });
}

module.exports = RecvFile;