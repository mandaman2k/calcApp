var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var coins = db.get('coins');
var fiat = db.get('fiat');
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
}).then(() => {
    console.log('end');
    // stream is over
});

fiat.find({}).each((coin, { close, pause, resume }) => {
    db.close();
    switch (coin.name) {
        case "MXN":
            rp({
                method: 'GET',
                uri: coin.api,
                json: true
            }).then(function (response) {
                fiat.findOneAndUpdate({ name: "MXN" }, { $set: { "price": response.payload.bid } }, function (err, doc, next) {
                    console.log(doc);
                });
            }).catch(function (err) {
                db.close();
                throw err;
            });
            break;
        case "USD":
            rp({
                method: 'GET',
                uri: coin.api,
                json: true
            }).then(function (response) {
                fiat.findOneAndUpdate({ name: "USD" }, { $set: { "price": response[0].price_usd } }, function (err, doc, next) {
                    console.log(doc);
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
}).then(() => {
    console.log('end');
    // stream is over
});

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}