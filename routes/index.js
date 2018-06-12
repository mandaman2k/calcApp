var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var db = req.db;
    var collection = db.get('coins');
    var query = {
        "$or": [
            {
                "name": "MXN"
            },
            {
                "name": "USD"
            }
        ]
    };
    collection.find(query, { sort: { ticker: 1 } }, function (e, docs) {
        res.render('index', { title: 'Calculo Minar Granja', mxn: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(docs[0].price), usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(docs[1].price) });
    });
});

module.exports = router;
