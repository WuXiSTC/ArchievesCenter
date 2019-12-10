const fs = require("fs");
const path = require("path");

const Dao = require("../Dao/index");
const PathStats = Dao.PathStats;
const ValidFilename = Dao.ValidFilename;
const DirResolve = Dao.DirResolve;

/**
 * 构造一个写文件的中间件
 * @param rootPath 要把文件写在哪个根目录下
 * @param meta_name 从传入meta的哪个字段获取所需的输入，默认为"file"
 * @returns {Function} 返回写文件的中间件
 * @constructor
 */
function Writefile(rootPath, meta_name = "file") {
    /**
     * 写文件的中间件，输入：
     * meta.writeTo-要写入的文件路径
     */
    return async function (meta, stream, next, end) {//流式接收文件
        let meta_next = meta;
        meta = meta[meta_name];
        if (!meta || typeof meta.writeTo !== "string") {
            console.warn(`
            meta.writeTo有误或不存在，Writefile中间件未运行。
            请将要写入的文件路径放入meta.writeTo中。
            `);
            return next(stream);
        }

        if (!ValidFilename(meta.writeTo))
            throw new Error("非法路径名:" + meta.writeTo);

        let filename = path.join(rootPath, meta.writeTo);
        await DirResolve(filename);//解决路径不存在的问题
        let stats = await PathStats(filename);//检查文件是否存在
        if (stats !== null)//存在则报错
            throw new Error("文件" + filename + "已存在");

        let writeStream = fs.createWriteStream(filename, {flags: "w"});
        stream.on("end", end);
        stream.pipe(writeStream);
        return next(meta_next, stream);

    }
}

module.exports = Writefile;