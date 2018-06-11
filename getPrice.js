var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var dbCoins = db.get('coins');
var fiat = db.get('fiat');
var dbExchanges = db.get('exchanges');

rp({
    method: 'GET',
    uri: 'https://www.cryptopia.co.nz/api/GetMarkets',
    json: true
}).then(function (response) {
    dbCoins.find({ "exchange": "cryptopia" }, {}, function (err, result) {
        db.close(function () {
            console.log('cerre 7 ');
        });
        result.forEach(coin => {
            dbCoins.findOneAndUpdate({ address: coin.address }, { $set: { "price": parseFloat(findElement(response.Data, "Label", coin.ticker + "/BTC").BidPrice).toFixed(8) } }, function (err, doc, next) {
                db.close(function () {
                    console.log('cerre 8 ' + coin.name);
                });
            });
        });
    })
});

rp({
    method: 'GET',
    uri: 'https://api.crypto-bridge.org/api/v1/ticker',
    json: true
}).then(function (response) {
    dbCoins.find({ "exchange": "CB" }, {}, function (err, result) {
        db.close(function () {
            console.log('cerre 1 ');
        });
        result.forEach(coin => {
            dbCoins.findOneAndUpdate({ address: coin.address }, { $set: { "price": parseFloat(findElement(response, "id", coin.ticker + "_BTC").bid).toFixed(8) } }, function (err, doc, next) {
                db.close(function () {
                    console.log('cerre 2 ' + coin.name);
                });
            });
        });
    })
});

rp({
    method: 'GET',
    uri: 'https://stocks.exchange/api2/ticker',
    json: true
}).then(function (response) {
    dbCoins.find({ "exchange": "stocks.exchange" }, {}, function (err, result) {
        db.close(function () {
            console.log('cerre 3 ');
        });
        result.forEach(coin => {
            dbCoins.findOneAndUpdate({ address: coin.address }, { $set: { "price": parseFloat(findElement(response, "market_name", coin.ticker + "_BTC").bid).toFixed(8) } }, function (err, doc, next) {
                db.close(function () {
                    console.log('cerre 4 ' + coin.name);
                });
            });
        });
    })
});

rp({
    method: 'GET',
    uri: 'https://graviex.net:443//api/v2/tickers.json',
    json: true
}).then(function (response) {
    dbCoins.find({ "exchange": "graviex" }, {}, function (err, result) {
        db.close(function () {
            console.log('cerre 5 ');
        });
        result.forEach(coin => {
            dbCoins.findOneAndUpdate({ address: coin.address }, { $set: { "price": parseFloat(response[coin.ticker.toLowerCase() + 'btc'].ticker.buy).toFixed(8) } }, function (err, doc, next) {
                db.close(function () {
                    console.log('cerre 6 ' + coin.name);
                });
            });
        });
    })
});

rp({
    method: 'GET',
    uri: 'https://api.bitso.com/v3/ticker/?book=btc_mxn',
    json: true
}).then(function (response) {
    fiat.findOneAndUpdate({ name: "MXN" }, { $set: { "price": parseFloat(response.payload.bid).toFixed(2) } }, function (err, doc, next) {
        db.close(function () {
            console.log('cerre 9 ');
        });
    });
});

rp({
    method: 'GET',
    uri: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
    json: true
}).then(function (response) {
    fiat.findOneAndUpdate({ name: "USD" }, { $set: { "price": parseFloat(response[0].price_usd).toFixed(2) } }, function (err, doc, next) {
        db.close(function () {
            console.log('cerre 10 ');
        });
    });
});

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}