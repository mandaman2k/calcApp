var express = require('express');
var router = express.Router();
var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'admin' && user.pass === 'presarios') {
    return next();
  } else {
    return unauthorized(res);
  };
};

/* GET home page. */
router.get('/', auth, function (req, res, next) {
  var db = req.db;
  var collection = db.get('coins');

  var query = [
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
    },
    {
      "$sort": { "ticker": 1 }
    }
  ];

  collection.aggregate(query, {}, function (e, docs) {

    var mxn = findElement(docs, 'ticker', 'MXN').price;
    var usd = findElement(docs, 'ticker', 'USD').price;

    res.render('index', {
      title: 'Calculo Minar Granja',
      CurrMxn: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mxn),
      CurrUsd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd),
      mxn: mxn,
      usd: usd,
      coins: docs
    });
  });
});

function findElement(arr, propName, propValue) {
  for (var i = 0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];

  // will return undefined if not found; you could return a default instead
}

module.exports = router;
