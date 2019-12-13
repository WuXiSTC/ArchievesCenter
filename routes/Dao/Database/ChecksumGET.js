const connection = require("./connection");
const {getChecksumName, getChecksumSetName} = require("./getChecksum");

/**
 * 比较filename的hash值和输入的hash值
 * @param checksums 输入的hash值列表
 * @param filename 要比较的文件名
 * @returns {Promise<int>} 返回hash值重合的个数，只要有一个不重合就返回0
 * @constructor
 */
async function CompareChecksums(checksums, filename) {
    let overlap_ratio = 0;
    for (let alg of Object.keys(checksums)) {
        let checksum_fom_db = await connection.hget(getChecksumName(alg), filename);//从数据库中获取hash值
        if (checksum_fom_db != null) {//如果hash值存在
            if (checksums[alg] !== checksum_fom_db)//则和输入的hash值比对
                return 0;//只要有一个不一样就返回0
            overlap_ratio++;//否则重合度加一
        }
    }
    return overlap_ratio;//返回重合度
}

/**
 * 通过一串校验码从数据库中查找对应文件路径，找到则返回一个文件路径，找不到返回null
 * @param checksums 为要查找的校验码列表，其中的校验码数量可能有多个（一个文件由不同算法算出的多个校验码）
 * @param overlap_threshold 重合度阈值，若没有查到有文件大于此重合度则直接返回空集
 * @constructor
 * @return {Array}
 */
async function ChecksumGET(checksums, overlap_threshold) {
    let setNames = [];
    for (let alg of Object.keys(checksums))
        setNames.push(getChecksumSetName(alg, checksums[alg]));//保存所有的hash值对应的文件集合名称
    let union = await connection.sunion(...setNames);//对所有这些文件集合求并集

    let most_overlap_files = [];//重合度最大的文件列表
    let max_overlap_ratio = overlap_threshold;//最大重合度
    for (let filename of union) {//遍历这个并集中的文件
        let overlap_ratio = await CompareChecksums(checksums, filename);//一个个地获取重合度
        if (overlap_ratio === max_overlap_ratio)//如果此文件的重合度和最大重合度相等
            most_overlap_files.push(filename);//则把文件加入集合
        else if (overlap_ratio > max_overlap_ratio) {//如果此文件重合度大于最大重合度
            most_overlap_files = [filename];//则更新文件列表
            max_overlap_ratio = overlap_ratio;//并更新最大重合度
        }
    }
    return most_overlap_files;
}

module.exports = ChecksumGET;