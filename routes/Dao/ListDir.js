const fs = require("fs");
const path = require("path");
const pathStats = require("./tools/pathStats");
const dir = require("./tools/config").dir;


exports.ListDir = async (dirname) => {
    let dirName = path.join(dir, dirname);
    let stats = await pathStats(dirName);
    return new Promise((resolve, reject) => {
        if (stats === null) return reject("文件夹" + dirName + "不存在");
        if (!stats.isDirectory()) return reject("文件夹" + dirName + "不是目录");
        fs.readdir(dirName, async (err, files) => {//遍历目标文件夹
            if (err) return reject(err);
            let list = [[], []];//子文件夹放0，文件放1
            for (let file in files) {
                let stats = await pathStats(file);
                if (stats !== null) {
                    if (stats.isDirectory()) list[0].push(file);
                    else if (stats.isFile()) list[1].push(file);
                }
            }
            resolve(list);
        })
    })
};