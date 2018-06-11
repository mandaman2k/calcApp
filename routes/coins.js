var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/list', function (req, res, next) {
  var db = req.db;
  var collection = db.get('coins');
  collection.find({}, { sort: { ticker: 1 } }, function (e, docs) {
    res.json(docs);
  });
});

router.get('/totales', function (req, res, next) {
  var db = req.db;
  var collection = db.get('coins');
  collection.aggregate([{
    $group: {
      _id: {
        ticker: "$ticker",
        price: "$price"
      },
      "balanceTotal" : {
        $sum: "$balance"
      }
    }
  }, {
    $project: {
      ticker: "$_id.ticker",
      price: "$_id.price",
      "balanceTotal": "$balanceTotal"
    }
  }, {
    $skip: 0
  }])
})

router.post('/add', function (req, res) {
  var db = req.db;
  var collection = db.get('coins');
  collection.insert(req.body, function (err, result) {
    res.send(
      err === null ? { msg: '' } : { msg: err }
    );
  });
});

module.exports = router;
