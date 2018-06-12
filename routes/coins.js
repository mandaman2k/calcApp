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

router.delete('/delete/:id', function (req, res) {
  var db = req.db;
  var collection = db.get('coins');
  var coinToDelete = req.params.id;
  collection.remove({ '_id': coinToDelete }, function (err) {
    res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
  });
});

router.put('/update/:id', function (req, res, next) {
  var db = req.db;
  var collection = db.get('coins');
  var coinToUpdate = req.params.id;
  var coinBalance = Number(req.body.balance);
  var a = 1;
  if (coinToUpdate == 'BTC') {
    collection.update({ ticker: 'BTC' }, { $set: { "balance": coinBalance } }, function (err) {
      if (err) throw err;
      res.send((err === null) ? {msg: ''} : {msg: 'error' + err});
    });
  }
});

module.exports = router;
