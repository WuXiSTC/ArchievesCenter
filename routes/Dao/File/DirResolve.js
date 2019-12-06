const fs = require("fs");
const path = require("path");
const pathStats = require("./PathStats");

async function mkdirs(p) {//递归创建文件夹
    return new Promise(async (resolve, reject) => {
        try {
            let stats = await pathStats(p);//检查目标文件夹路径
            if (stats === null) {//如果不存在就开始递归创建
                await mkdirs(path.dirname(p));//先创建父文件夹
                fs.mkdir(p, (err) => {//再创建目标文件夹
                    if (err) return reject(err);//创建出错则报错
                    return resolve();//创建成功则完成
                });
            } else if (!stats.isDirectory())//如果存在就判断是不是不是目录
                return reject(p + "是文件");//不是目录就报错
            else {
                return resolve()//是目录就完成
            }
        } catch (e) {
            return reject(e)
        }
    });
}

function DirResolve(filename) {//解决文件目录不存在的问题（递归创建目录）
    return mkdirs(path.dirname(filename));
}

module.exports = DirResolve;