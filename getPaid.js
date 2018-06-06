var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var dbCoins = db.get('coins');
var dbPool = db.get('pools');
var dbMined = db.get('mined');

dbPool.find({}).each((pool, { close, pause, resume }) => {
    dbCoins.find({ pool: pool.name }, {}, function (err, result) {
        db.close();
        result.forEach(coin => {
            rp({
                method: 'GET',
                uri: pool.api + coin.address,
                json: true
            }).then(function (response) {
                var now = new Date(Date.now());
                var date = now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }).split(' ')[0];
                if (!response.error) {
                    dbMined.findOneAndUpdate({ $and: [{ address: coin.address }, { [date] : {'$exists': true} }] }, { $set: { "address": coin.address, [date]: response.paid24h } }, { upsert: true }, function (err, doc, next) {
                        db.close();
                        console.log(doc);
                    });
                } else {
                    db.close();
                }
            }).catch(function (err) {
                db.close();
                throw err;
            });
        });
    });
}).then(() => {
    console.log('end');
    // stream is over
});

