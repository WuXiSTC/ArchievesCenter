const fs = require("fs");
const path = require("path");

const Dao = require("../Dao/index");
const PathStats = Dao.PathStats;
const ValidFilename = Dao.ValidFilename;

/**
 * 构造一个读文件的中间件
 * @param rootPath 要从哪个根目录下读文件
 * @param meta_name 从传入meta的哪个字段获取所需的输入，默认为"file"
 * @returns {Function} 返回读文件的中间件
 * @constructor
 */
function Readfile(rootPath, meta_name = "file") {
    /**
     * 读文件的中间件，输入：
     * meta[meta_name].readFrom-要读的文件路径
     * (Optional)meta[meta_name].start-要从哪开始读
     * (Optional)meta[meta_name].end-要读到哪为止
     */
    return async function (meta, stream, next, emitter) {//流式读取文件
        meta = meta[meta_name];
        if (!meta || typeof meta.readFrom !== "string") {
            emitter.emit("warn", `
            meta.readFrom有误或不存在，Readfile中间件未运行。
            请将要写入的文件路径放入meta.readFrom中。
            `);
            return;
        }

        if (!ValidFilename(meta.readFrom))
            return emitter.emit("error", "非法路径名:" + meta.readFrom);

        let filename = path.join(rootPath, meta.readFrom);
        let stats = await PathStats(filename);
        if (stats === null || !stats.isFile())
            emitter.emit("error", "文件" + filename + "不存在");

        let options = {flags: "r"};
        if (meta.start) {
            try {
                options.start = parseInt(meta.start)
            } catch (e) {
                emitter.emit("error", e);
            }
        }
        if (meta.end) {
            try {
                options.start = parseInt(meta.end)
            } catch (e) {
                emitter.emit("error", e);
            }
        }
        next(fs.createReadStream(filename, options));
    }
}

module.exports = Readfile;