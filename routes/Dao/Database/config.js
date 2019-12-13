const ChecksumList = {
    "md5": ["md5", "md-5"],
    "sha1": ["sha1", "sha-1"],
    "sha192": ["sha192", "sha-192"],
    "sha256": ["sha256", "sha-256"],
    "sha512": ["sha512", "sha-512"]
};

const ChecksumNames = {};

for (let name of Object.keys(ChecksumList))
    for (let nick_name of ChecksumList[name])
        ChecksumNames[nick_name] = name;

function getChecksumName(algorithm) {
    algorithm = algorithm.toLowerCase();
    return ChecksumNames[algorithm] || algorithm;
}

module.exports = {ChecksumList, ChecksumNames, getChecksumName};