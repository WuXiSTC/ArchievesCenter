var express = require('express');
var router = express.Router();

const Dao = require('./Dao/index');

/* GET home page. */
router.get('/*', async function (req, res, next) {
    let dirname = req.params[0];
    try {
        let list = await Dao.ListDir(dirname);
        res.statusCode = 200;
        return res.end(JSON.stringify(list))
    } catch (e) {
        res.statusCode = 404;
        res.end(e.toString());
    }
});

module.exports = router;
