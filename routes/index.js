var express = require('express');
var router = express.Router();

const Dao = require('./Dao');

function valid_filename(filename) {
    if (filename.length < 1) return false;
    filename = filename.replace('\\', '/');
    if (filename[0] === '/') return false;
    if (filename.indexOf('/..') > -1 || filename.indexOf('../') > -1) return false;
    return true
}

function get_range_from_req(req) {
    let range = req.headers['range'];
    if (!range) return false;
    let result = range.match(/bytes=(\d*)-(\d*)/);
    if (!result) return false;
    result[1] = isNaN(result[1]) ? result[1] : parseInt(result[1]);
    result[2] = isNaN(result[2]) ? result[2] : parseInt(result[2]) - 1;
    return [result[1], result[2]]
}

/* GET home page. */
router.get('/*', async function (req, res, next) {
    let filename = req.params[0];
    if (!valid_filename(filename)) return res.sendStatus(404);
    try {
        res.setHeader('Accept-Ranges', 'bytes');
        res.statusCode = 206;
        let range = get_range_from_req(req);
        let md5 = '';
        if (!range) {
            md5 = await Dao.SendFile(filename, res);
            console.log("Got: " + filename + " from start to end and its md5 is " + md5);
        } else {
            md5 = await Dao.SendFile(filename, res, range[0], range[1]);
            console.log("Got: " + filename + " from " + range[0] + " to " + range[1] + " and its md5 is " + md5);
        }

        return res.end()
    } catch (e) {
        console.log(e);
        res.sendStatus(404);
    }
});

router.put('/*', async function (req, res, next) {
    let filename = req.params[0];
    if (!valid_filename(filename)) return res.sendStatus(404);
    try {
        let md5 = await Dao.RecvFile(filename, req);
        console.log("Put: " + filename + " and its md5 is " + md5);
        return res.end(md5)
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = router;
