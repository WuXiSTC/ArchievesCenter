const fs = require('fs');

/**
 * 获取文件或文件夹的stat，如果文件不存在则返回null
 * @param path 要获取的文件路径
 * @returns {Promise}
 * @constructor
 */
function PathStats(path) {
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

module.exports = PathStats;