const {getChecksumName} = require("./config");

/**
 * 通过算法名称和其值构造其在数据库中的集合名称
 * @param algorithm 算法名
 * @param value 计算值
 * @constructor
 * @return {string}
 */
function getChecksumSetName(algorithm, value) {
    return getChecksumName(algorithm) + ":" + value;
}

module.exports = {getChecksumSetName, getChecksumName};