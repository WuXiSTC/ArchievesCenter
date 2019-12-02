const fs = require('fs');

function pathStats(path) {//获取文件或文件夹的stat，如果不存在则返回null
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {//如果出错
                if (err.code === "ENOENT")//如果是不存在
                    return resolve(null);//返回false
                return reject(err);//否则报错
            }
            return resolve(stats);
        })
    })
}

module.exports = pathStats;