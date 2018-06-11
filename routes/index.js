var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var db = req.db;
  var collection = db.get('fiat');
  collection.find({}, { sort: { ticker: 1 } }, function (e, docs) {
    res.render('index', { title: 'Calculo Minar Granja', mxn: docs[0].price, usd: docs[1].price });
  });
});

module.exports = router;
