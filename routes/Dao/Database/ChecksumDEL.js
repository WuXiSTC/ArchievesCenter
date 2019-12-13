const connection = require("./connection");
const {ChecksumList} = require("./config");
const {getChecksumSetName} = require("./getChecksum");

/**
 * 删除数据库中的某个校验码对应的文件
 * @param filename 要删除的文件路径
 * @param checksums 要删除的校验码列表，其中的校验码数量可能有多个（一个文件由不同算法算出的多个校验码）
 * @returns {Promise<void>}
 * @constructor
 */
async function ChecksumDEL(filename, checksums) {
    for (let alg of Object.keys(ChecksumList)) {//遍历所有hash方法
        let checksum = await connection.hget(alg, filename);//获取此hash方法的结果
        if (checksum !== null) {//如果有结果
            await connection.srem(getChecksumSetName(alg, checksum), filename);//那就删除集合中的文件记录
            await connection.hdel(alg, filename);//然后删除hash表中的文件记录
        }
    }
    if (!checksums) return;//如果没有输入checksums那就结束
    for (let alg of Object.keys(checksums))//否则就继续删集合
        await connection.srem(getChecksumSetName(alg, checksums[alg]), filename)
}

module.exports = ChecksumDEL;