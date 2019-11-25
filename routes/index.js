var express = require('express');
var router = express.Router();

const Dao = require('./Dao');

/* GET home page. */
router.get('/*', async function (req, res, next) {
    let filename = req.params[0];
    if (filename.length < 1) return res.sendStatus(404);
    try {
        let md5 = await Dao.SendFile(filename, res);
        console.log("Got: " + filename + " and its md5 is " + md5);
        return res.end()
    } catch (e) {
        console.log(e);
        res.sendStatus(404);
    }
});

router.put('/*', async function (req, res, next) {
    let filename = req.params[0];
    if (filename.length < 1) return res.sendStatus(404);
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
