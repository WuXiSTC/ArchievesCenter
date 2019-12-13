const fs = require("fs");
const Dao = require("../Dao/index");
const ChecksumGET = Dao.ChecksunGET;
const PathStats = Dao.PathStats;
const ChecksumDEL = Dao.ChecksunDEL;

/**
 * 构造一个秒传中间件，把文件读流直接接到文件写流上
 * @param meta_name 从meta的何处取数据
 * @param overlap_threshold 至少要多少个hash值相同才能算同一个文件
 * @returns {Function} 返回一个秒传中间件
 * @constructor
 */
function ReadExistsfile(meta_name, overlap_threshold = 2) {
    return async function (meta, stream, next, end) {
        let hash_to_find = meta[meta_name];
        if (Object.keys(hash_to_find).length < overlap_threshold) {
            console.warn([`传入的checksum数量${hash_to_find.length}小于checksum重合阈值${overlap_threshold}，`,
                `秒传模块未运行，请至少传入多于${overlap_threshold}个checksum`].join(''));
            next(meta, stream);
            end();
            return;
        }

        let files = await ChecksumGET(hash_to_find, overlap_threshold);//通过hash值获取到相似文件列表
        for (let file of files) {//遍历相似文件列表
            let stats = await PathStats(file);
            if (stats !== null && stats.isFile()) {//如果文件路径存在且是文件
                stream = fs.createReadStream(file);//那就替换流
            } else await ChecksumDEL(file, hash_to_find);//否则说明数据库的记录有误，删除此文件的记录
        }
        stream.on("end", end);
        next(meta, stream);
    }
}

module.exports = ReadExistsfile;