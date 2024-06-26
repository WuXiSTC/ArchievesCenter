const redis = require("redis");

const redis_addr = process.env.npm_config_pika ? process.env.npm_config_pika : "redis://127.0.0.1:9221";

let client = redis.createClient(redis_addr, {
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED')
            console.error('连接被拒绝');
        console.warn('重试连接: ' + options.times_connected);
        return Math.max(options.attempt * 100, 3000);
    }
});
client.on("error", (e) => {
    console.error("Redis 连接出错: " + e);
});

const supported_commands = ['hset', 'hget', 'hdel', 'sadd', 'smembers', 'sunion', 'srem'];

function Connection() {
    for (let command of supported_commands)
        this[command] = function () {
            let args = arguments;
            return new Promise((resolve, reject) => {
                if (!client.connected) return resolve([]);
                client[command](...args, (error, result) => {
                    if (error) return reject(error);
                    return resolve(result)
                })
            })
        }
}

module.exports = new Connection();