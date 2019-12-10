var express = require('express');
var router = express.Router();

const Service = require('./Service/index');
const SendFile = Service.SendFile;
const RecvFile = Service.RecvFile;

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
    try {
        res.setHeader('Accept-Ranges', 'bytes');
        let range = get_range_from_req(req);
        if (!range) {
            res.statusCode = 200;
            await SendFile(filename, res);
            console.log("Got: " + filename + " from start to end");
        } else {
            res.statusCode = 206;
            await SendFile(filename, res, range[0], range[1]);
            console.log("Got: " + filename + " from " + range[0] + " to " + range[1]);
        }
        return res.end()
    } catch (e) {
        res.statusCode = 404;
        return res.end(e.toString());
    }
});

router.post('/*', async function (req, res, next) {
    let filename = req.params[0];
    try {
        let hashs = JSON.stringify(await RecvFile(filename, req));
        console.log("Put: " + filename + " and its checksum is " + hashs);
        res.statusCode = 200;
        return res.end(hashs)
    } catch (e) {
        res.statusCode = 409;
        res.end(e.toString());
    }
});

module.exports = router;
