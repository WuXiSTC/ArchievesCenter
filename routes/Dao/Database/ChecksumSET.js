const connection = require("./connection");
const {getChecksumName, getChecksumSetName} = require("./getChecksum");
const ChecksumDEL = require("./ChecksumDEL");

/**
 * 通向数据库中插入校验码和文件路径
 * @param checksums 为要插入的校验码列表，其中的校验码数量可能有多个（一个文件由不同算法算出的多个校验码）
 * @param filename 为要插入的文件路径
 * @returns {Promise<void>}
 * @constructor
 */
async function ChecksumSET(checksums, filename) {
    await ChecksumDEL(filename, checksums);//先删除对应文件的hash记录
    for (let alg of Object.keys(checksums)) {
        await connection.hset(getChecksumName(alg), filename, checksums[alg]);//在文件对应的hash值集合中插入hash值
        await connection.sadd(getChecksumSetName(alg, checksums[alg]), filename);//在哈希值对应的文件集合中插入文件
    }
}

module.exports = ChecksumSET;