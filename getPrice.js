var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var coins = db.get('coins');
var dbExchanges = db.get('exchanges');

dbExchanges.find({}).each((exchange, { close, pause, resume }) => {
    coins.find({ exchange: exchange.name }, {}, function (err, result) {
        db.close();
        switch (exchange.name) {
            case "cryptopia":
                result.forEach(coin => {
                    rp({
                        method: 'GET',
                        uri: exchange.api + '/' + coin.ticker + '_BTC',
                        json: true
                    }).then(function (response) {
                        coins.findOneAndUpdate({ address: coin.address }, { $set: { "price": response.Data.BidPrice } }, function (err, doc, next) {
                            console.log(doc); 
                        });
                    }).catch(function (err) {
                        db.close();
                        throw err;
                    });
                });
                break;
            case "CB":
                rp({
                    method: 'GET',
                    uri: 'https://api.crypto-bridge.org/api/v1/ticker',
                    json: true
                }).then(function (response) {
                    result.forEach(coin => {
                        coins.findOneAndUpdate({ address: coin.address }, { $set: { "price": findElement(response, "id", coin.ticker + "_BTC").bid } }, function (err, doc, next) {
                            console.log(doc);
                            db.close();
                        });
                    });
                }).catch(function (err) {
                    db.close();
                    throw err;
                });
                break;

            default:
                db.close();
                break;
        }
        db.close();
    });
});

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}