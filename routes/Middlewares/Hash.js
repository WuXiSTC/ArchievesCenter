const crypto = require('crypto');

/**
 * 生成一个流式计算hash值的中间件
 * @param encoding hash值计算结果的编码方式
 * @param onFinish 计算完成时调用的函数，输入形参为hash值计算结果
 * @returns {Function} 返回流式计算hash值的中间件
 * @constructor
 */
function Hash(encoding, onFinish) {
    //生成一个加密模块输入变量为输出的编码方式，默认为hex
    encoding = (typeof encoding === "string") ? encoding : "base64";
    return function (meta, stream, next, emitter) {
        //上一层输入的meta.HashAlgs为要使用的hash算法名列表
        if (!(meta.HashAlgs instanceof Array)) {
            emitter.emit("error", `
            meta.HashAlgs有误或不存在，Hash中间件未运行。
            请将您需要的Hash算法按顺序组成Array放入meta.HashAlgs中。
            `);
            return next(stream);
        }
        let hashStreams = [];
        for (let hashAlg of meta.HashAlgs) {
            let hashStream = crypto.createHash(hashAlg);
            stream.pipe(hashStream);
            hashStreams.push(hashStream);
        }
        stream.on('end', function () {
            let hashResults = [];
            for (let hashStream in hashStreams)
                hashResults.push(hashStream.digest(encoding));
            onFinish(hashResults);
        });
        next(stream);
    };
}

module.exports = Hash;