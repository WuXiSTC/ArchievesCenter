const crypto = require('crypto');

function PipeStream(readStream, writeStream) {//将一个读取流pipe到写入流，并计算MD5
    const md5Stream = crypto.createHash('md5');
    md5Stream.setEncoding('base64');
    return new Promise((resolve, reject) => {

        readStream.on('open', function (fd) {
            console.log('stream was opened, fd - ', fd);
        });
        readStream.on('data', function (chunk) {
            console.log('piped %d bytes', chunk.length);
        });
        readStream.on('end', function () {
            console.log('pipe ended');
            return resolve(md5Stream.digest("hex"));
        });

        readStream.on('error', function (err) {
            return reject(err);
        });
        readStream.on('close', function () {
            console.log('pipe closed.');
        });

        readStream.pipe(writeStream);
        readStream.pipe(md5Stream);
    })
}

module.exports = PipeStream;