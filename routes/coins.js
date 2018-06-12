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

router.get('/balance', function (req, res, next) {
  var db = req.db;
  var collection = db.get('coins');

  var pipeline = [
    {
      "$group": {
        "_id": {
          "ticker": "$ticker",
          "price": "$price"
        },
        "SUM(balance)": {
          "$sum": "$balance"
        }
      }
    },
    {
      "$project": {
        "_id": 0,
        "ticker": "$_id.ticker",
        "price": "$_id.price",
        "balance": "$SUM(balance)"
      }
    }
  ];

  collection.aggregate(pipeline, {}, function (err, docs) {
    res.json(docs);
  });

});

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
