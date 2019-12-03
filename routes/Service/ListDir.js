const fs = require("fs");
const path = require("path");
const dir = require("./config").dir;
const Dao = require("../Dao/index");
const pathStats = Dao.pathStats;
const valid_filename = Dao.valid_filename;


async function ListDir(dirname) {//返回dirname目录下的文件和文件夹
    if (!valid_filename(dirname)) throw new Error("非法路径名:" + dirname);
    let dirName = path.join(dir, dirname);
    let stats = await pathStats(dirName);
    return new Promise((resolve, reject) => {
        if (stats === null) return reject("文件夹" + dirName + "不存在");
        if (!stats.isDirectory()) return reject("文件夹" + dirName + "不是目录");
        fs.readdir(dirName, async (err, files) => {//遍历目标文件夹
            if (err) return reject(err);
            let list = [[], []];//子文件夹放0，文件放1
            for (let i in files) {
                let stats = await pathStats(path.join(dirName, files[i]));
                if (stats !== null) {
                    if (stats.isDirectory()) list[0].push(files[i]);
                    else if (stats.isFile()) list[1].push(files[i]);
                }
            }
            resolve(list);//返回值为[[文件夹列表],[文件列表]]
        })
    })
}

module.exports = ListDir;