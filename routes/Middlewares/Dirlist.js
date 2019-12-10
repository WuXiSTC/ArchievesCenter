const fs = require("fs");
const path = require("path");
const Dao = require("../Dao/index");
const PathStats = Dao.PathStats;
const ValidFilename = Dao.ValidFilename;
const ReadDir = Dao.ReadDir;

function Dirlist(rootPath, meta_name = "directory", list_meta_name = "list") {
    return async function (meta, stream, next, end) {
        let meta_next = meta;
        meta = meta[meta_name];
        if (!ValidFilename(meta.dirname)) throw new Error("非法路径名:" + meta.dirname);
        let dirName = path.join(rootPath, meta.dirname);
        let stats = await PathStats(dirName);
        if (stats === null) throw new Error("文件夹" + dirName + "不存在");
        if (!stats.isDirectory()) throw new Error("文件夹" + dirName + "不是目录");
        let files = await ReadDir(dirName);
        let list = [[], []];//子文件夹放0，文件放1
        for (let file of files) {//遍历目标文件夹
            let stats = await PathStats(path.join(dirName, file));
            if (stats !== null) {
                if (stats.isDirectory()) list[0].push(file);
                else if (stats.isFile()) list[1].push(file);
            }
        }
        meta[list_meta_name] = list;
        next(meta_next, stream);
        end();
    }
}

module.exports = Dirlist;