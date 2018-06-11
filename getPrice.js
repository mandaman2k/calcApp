var Request = require("request");
var rp = require('request-promise');

// Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/calc');

mongoose.Promise = global.Promise

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var coinSchema = new Schema({
    name: String,
    ticker: String,
    address: String,
    explorer: String,
    pool: String,
    exchange: String,
    balance: Number,
    price: Number
});

var fiatSchema = new Schema({
    name: String,
    api: String,
    price: Number
});

var coinModel = mongoose.model('coins', coinSchema);

var fiatModel = mongoose.model('fiat', fiatSchema);

var coin = coinModel;
var fiat = fiatModel;
//End Database

var end = 0;

function finished(done) {
    end = end + done;
    if (end == 6) {
        mongoose.disconnect();
    }
}

rp({
    method: 'GET',
    uri: 'https://www.cryptopia.co.nz/api/GetMarkets',
    json: true
}).then(function (response) {
    coin.find({ exchange: "cryptopia" }, function (err, coins) {
        var count = coins.length;
        coins.forEach(element => {
            coin.findOneAndUpdate({ address: element.address }, { price: parseFloat(findElement(response.Data, "Label", element.ticker + "/BTC").BidPrice).toFixed(8) }, function (err) {
                if (err) throw err;
                count = count - 1;
                if (count == 0) {
                    finished(1);
                }
            });
        });
    });
}).catch(function (err) {
    throw err;
});

rp({
    method: 'GET',
    uri: 'https://api.crypto-bridge.org/api/v1/ticker',
    json: true
}).then(function (response) {
    coin.find({ exchange: "CB" }, function (err, coins) {
        var count = coins.length;
        coins.forEach(element => {
            coin.findOneAndUpdate({ address: element.address }, { price: Number(findElement(response, "id", element.ticker + "_BTC").bid).toFixed(8).replace(/\.?0+$/, "") }, function (err) {
                if (err) throw err;
                count = count - 1;
                if (count == 0) {
                    finished(1);
                }
            });
        });
    });
}).catch(function (err) {
    throw err;
});


rp({
    method: 'GET',
    uri: 'https://stocks.exchange/api2/ticker',
    json: true
}).then(function (response) {
    coin.find({ exchange: "stocks.exchange" }, function (err, coins) {
        var count = coins.length;
        coins.forEach(element => {
            coin.findOneAndUpdate({ address: element.address }, { price: Number(findElement(response, "market_name", element.ticker + "_BTC").bid).toFixed(8).replace(/\.?0+$/, "") }, function (err) {
                if (err) throw err;
                count = count - 1;
                if (count == 0) {
                    finished(1);
                }
            });
        });
    });
}).catch(function (err) {
    throw err;
});


rp({
    method: 'GET',
    uri: 'https://graviex.net/api/v2/tickers.json',
    json: true
}).then(function (response) {
    coin.find({ exchange: "graviex" }, function (err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                coin.findOneAndUpdate({ address: element.address }, { price: Number(response[element.ticker.toLowerCase() + 'btc'].ticker.buy).toFixed(8).replace(/\.?0+$/, "") }, function (err) {
                    if (err) throw err;
                    count = count - 1;
                    if (count == 0) {
                        finished(1);
                    }
                });
            });
        } else {
            finished(1);
        }
    });
}).catch(function (err) {
    throw err;
});


rp({
    method: 'GET',
    uri: 'https://api.bitso.com/v3/ticker/?book=btc_mxn',
    json: true
}).then(function (response) {
    fiat.findOneAndUpdate({ name: "MXN" }, { $set: { price: parseFloat(response.payload.bid).toFixed(2) } }, function (err) {
        if (err) throw err;
        finished(1);
    });
});


rp({
    method: 'GET',
    uri: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
    json: true
}).then(function (response) {
    fiat.findOneAndUpdate({ name: "USD" }, { price: parseFloat(response[0].price_usd).toFixed(2) }, function (err) {
        if (err) throw err;
        finished(1);
    });
});

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}