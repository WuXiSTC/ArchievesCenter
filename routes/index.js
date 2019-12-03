var express = require('express');
var router = express.Router();

const ListDir = require('./Service/index').ListDir;

/* GET home page. */
router.get('/*', async function (req, res, next) {
    let dirname = req.params[0];
    try {
        let list = await ListDir(dirname);
        res.statusCode = 200;
        return res.end(JSON.stringify(list))
    } catch (e) {
        res.statusCode = 404;
        res.end(e.toString());
    }
});

module.exports = router;
