var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var dbCoins = db.get('coins');
var dbPool = db.get('pools');
var dbMined = db.get('mined');

dbCoins.find({}, {}, function (err, result) {
    if(err) throw err;

    result.forEach(coin => {
        if(coin.pool == "http://bsod.pw") coin.pool = "http://api.bsod.pw";
        rp({
            method: 'GET',
            uri: coin.pool + '/api/wallet?address=' + coin.address,
            json: true
        }).then(function (response) {
            var now = new Date(Date.now());
            var date = now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }).split(' ')[0];
            if (!response.error) {
                dbMined.findOneAndUpdate({ $and: [{ name: coin.name }, { [date]: { '$exists': true } }] }, { $set: { "name": coin.name, [date]: response.paid24h } }, { upsert: true }, function (err, doc, next) {
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

