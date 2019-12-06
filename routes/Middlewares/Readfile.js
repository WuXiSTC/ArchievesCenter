const fs = require("fs");
const path = require("path");

const Dao = require("../Dao/index");
const PathStats = Dao.PathStats;
const ValidFilename = Dao.ValidFilename;

/**
 * 构造一个读文件的中间件
 * @param rootPath 要从哪个根目录下读文件
 * @returns {Function} 返回读文件的中间件
 * @constructor
 */
function Readfile(rootPath) {
    /**
     * 读文件的中间件，输入：
     * meta.file.readFilename-要读的文件路径
     * (Optional)meta.file.readFrom-要从哪开始读
     * (Optional)meta.file.readTo-要读到哪为止
     */
    return async function (meta, stream, next, emitter) {//流式读取文件
        if (!meta.file || typeof meta.file.readFilename !== "string") {
            emitter.emit("warn", `
            meta.readFilename有误或不存在，Readfile中间件未运行。
            请将要写入的文件路径放入meta.readFilename中。
            `);
            return;
        }
        let filename = path.join(rootPath, meta.file.readFilename);

        if (!ValidFilename(filename))
            return emitter.emit("error", "非法路径名:" + filename);
        let stats = await PathStats(filename);
        if (stats === null || !stats.isFile())
            emitter.emit("error", "文件" + filename + "不存在");

        let options = {flags: "r"};
        if (meta.file.readFrom) {
            try {
                options.start = parseInt(meta.file.readFrom)
            } catch (e) {
                emitter.emit("error", e);
            }
        }
        if (meta.file.readTo) {
            try {
                options.start = parseInt(meta.file.readTo)
            } catch (e) {
                emitter.emit("error", e);
            }
        }
        next(fs.createReadStream(filename, options));
    }
}

module.exports = Readfile;