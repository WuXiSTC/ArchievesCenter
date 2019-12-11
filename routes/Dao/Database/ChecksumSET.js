const connection = require("./connection");
const ChecksumKey = require("./ChecksumKey");

/**
 * 通向数据库中插入校验码和文件路径
 * @param checksums 为要插入的校验码列表，其中的校验码数量可能有多个（一个文件由不同算法算出的多个校验码）
 * @param filename 为要插入的文件路径
 * @returns {Promise<void>}
 * @constructor
 */
async function ChecksumSET(checksums, filename) {
    await connection.hset("file", filename, JSON.stringify(checksums));
    for (let alg of Object.keys(checksums))
        await connection.sadd(ChecksumKey(alg, checksums[alg]), filename);
}

module.exports = ChecksumSET;