const wchain = require("wchain");
const dir = require("./config").dir;
const DirlistMiddleware = require("../Middlewares/Dirlist");

let ListDir_wchain = wchain({pause_at_begin: false});
ListDir_wchain.use(DirlistMiddleware(dir));

async function ListDir(dirname) {//返回dirname目录下的文件和文件夹
    return new Promise((resolve, reject) => {
        let meta = {directory: {dirname}};
        ListDir_wchain.run(meta, null, (meta, stream) => {
            resolve(meta.directory.list)
        }, () => null).catch(reject);
    })
}

module.exports = ListDir;