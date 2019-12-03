//这个变量指定了要存储文件的最上层目录
exports.dir = process.env.npm_config_dir ? process.env.npm_config_dir : process.cwd();