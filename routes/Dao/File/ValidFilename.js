/**判断文件名是否合法
 * @return {boolean}
 */
function ValidFilename(filename) {
    if (filename.length < 1) return false;
    filename = filename.replace('\\', '/');
    if (filename[0] === '/') return false;
    if (filename.indexOf('/..') > -1 || filename.indexOf('../') > -1) return false;
    return true
}

module.exports = ValidFilename;