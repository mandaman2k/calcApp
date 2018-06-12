var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
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
        }
      ];

    collection.aggregate(query, { }, function (e, docs) {

        var mxn = findElement(docs,'ticker','MXN').price;
        var usd = findElement(docs, 'ticker', 'USD').price;

        res.render('index', { 
            title: 'Calculo Minar Granja', 
            mxn: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(mxn), 
            usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd),
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
