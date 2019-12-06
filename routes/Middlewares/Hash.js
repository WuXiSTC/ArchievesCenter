const crypto = require('crypto');

/**
 * 生成一个流式计算hash值的中间件
 * @param encoding hash值计算结果的编码方式
 * @param meta_name 从传入meta的哪个字段获取所需的输入，默认为"hash"
 * @returns {Function} 返回流式计算hash值的中间件
 * @constructor
 */
function Hash(encoding, meta_name = "hash") {
    //生成一个加密模块输入变量为输出的编码方式，默认为hex
    encoding = (typeof encoding === "string") ? encoding : "base64";
    /**
     * 读文件的中间件，输入：
     * meta[meta_name].Algs-所需的hash算法
     * (Optional)meta[meta_name].onFinish-计算完成时调用的函数，输入形参为hash值计算结果
     */
    return function (meta, stream, next, emitter) {
        meta = meta[meta_name];
        //上一层输入的meta.Algs为要使用的hash算法名列表
        if (!meta || !(meta.Algs instanceof Array)) {
            emitter.emit("error", `
            meta[meta_name].Algs有误或不存在，Hash中间件未运行。
            请将您需要的Hash算法按顺序组成Array放入meta[meta_name].Algs中。
            `);
            return next(stream);
        }
        let hashStreams = [];
        for (let hashAlg of meta.Algs) {
            let hashStream = crypto.createHash(hashAlg);
            stream.pipe(hashStream);
            hashStreams.push(hashStream);
        }
        stream.on('end', function () {
            let hashResults = [];
            for (let hashStream in hashStreams)
                hashResults.push(hashStream.digest(encoding));
            meta.onFinish(hashResults);
        });
        next(stream);
    };
}

module.exports = Hash;