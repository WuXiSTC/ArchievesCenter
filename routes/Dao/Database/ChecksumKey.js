const ChecksumNames = {
    "md5": "md5",
    "md-5": "md5",
    "sha1": "sha1",
    "sha-1": "sha1",
    "sha192": "sha192",
    "sha-192": "sha192",
    "sha256": "sha256",
    "sha-256": "sha256",
    "sha512": "sha512",
    "sha-512": "sha512",
};

function getChecksumName(algorithm) {
    algorithm = algorithm.toLowerCase();
    return ChecksumNames[algorithm] || algorithm;
}

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