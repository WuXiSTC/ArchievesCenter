const fs = require("fs");
const path = require("path");

const Dao = require("../Dao/index");
const PathStats = Dao.PathStats;
const ValidFilename = Dao.ValidFilename;
const DirResolve = Dao.DirResolve;

/**
 * 构造一个写文件的中间件
 * @param rootPath 要把文件写在哪个根目录下
 * @returns {Function} 返回写文件的中间件
 * @constructor
 */
function Writefile(rootPath) {
    /**
     * 写文件的中间件，输入：
     * meta.file.writeFilename-要写入的文件路径
     */
    return async function (meta, stream, next, emitter) {//流式接收文件
        if (!meta.file || typeof meta.file.writeFilename !== "string") {
            emitter.emit("warn", `
            meta.writeFilename有误或不存在，Writefile中间件未运行。
            请将要写入的文件路径放入meta.writeFilename中。
            `);
            return next(stream);
        }
        let filename = path.join(rootPath, meta.file.writeFilename);

        if (!ValidFilename(filename))
            return emitter.emit("error", "非法路径名:" + filename);

        await DirResolve(filename);//解决路径不存在的问题
        let stats = await PathStats(filename);//检查文件是否存在
        if (stats !== null)//存在则报错
            return emitter.emit("error", "文件" + filename + "已存在");

        let writeStream = fs.createWriteStream(filename, {flags: "w"});
        stream.pipe(writeStream);
        return next(stream);

    }
}

module.exports = Writefile;