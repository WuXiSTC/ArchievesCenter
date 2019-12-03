const crypto = require('crypto');

function PipeStream(readStream, writeStream, hashs) {
    //将一个读取流pipe到写入流，同时计算各类hash值
    //hashs为要计算的hash值列表
    let hashStreams = {};
    for (let hash of hashs.values()) {
        hashStreams[hash] = crypto.createHash(hash);
        hashStreams[hash].setEncoding('base64');
    }
    return new Promise((resolve, reject) => {

        readStream.on('open', function (fd) {
            console.log('stream was opened, fd - ', fd);
        });
        readStream.on('data', function (chunk) {
            console.log('piped %d bytes', chunk.length);
        });
        readStream.on('end', function () {
            console.log('pipe ended');
            for (let hash of hashs.values()) {
                hashStreams[hash] = hashStreams[hash].digest("hex")
            }
            return resolve(hashStreams);
        });

        readStream.on('error', function (err) {
            return reject(err);
        });
        readStream.on('close', function () {
            console.log('pipe closed.');
        });

        readStream.pipe(writeStream);
        for (let hash of hashs.values()) {
            readStream.pipe(hashStreams[hash]);
        }
    })
}

module.exports = PipeStream;