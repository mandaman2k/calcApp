var Request = require("request");
var rp = require('request-promise');

// Database
var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];
mongoose.connect(config.database, { authSource: config.auth });

mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var coinSchema = new Schema({
    name: String,
    ticker: String,
    address: String,
    explorer: String,
    api: String,
    pool: String,
    exchange: String,
    balance: Number,
    price: Number
});

var coinModel = mongoose.model('coins', coinSchema);

var coin = coinModel;
//End Database

var end = 0;

function finished(done) {
    end = end + done;
    if (end == 7) {
        mongoose.disconnect();
    }
}

//Cryptopia
rp({
    method: 'GET',
    uri: 'https://www.cryptopia.co.nz/api/GetMarkets',
    json: true
}).then(function(response) {
    coin.find({ exchange: "Cryptopia" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                coin.findOneAndUpdate({ address: element.address }, { price: parseFloat(findElement(response.Data, "Label", element.ticker + "/BTC").BidPrice).toFixed(8) }, function(err) {
                    if (err) throw err;
                    count = count - 1;
                    if (count == 0) {
                        console.log('Cryptopia');
                        finished(1);
                    }
                });
            });
        } else {
            console.log('Error Cryptopia');
            finished(1);
        }
    });
}).catch(function(err) {
    console.log('Error Cryptopia');
    finished(1);
    throw err;
});

//CryptoBridge
rp({
    method: 'GET',
    uri: 'https://api.crypto-bridge.org/api/v1/ticker',
    json: true
}).then(function(response) {
    coin.find({ exchange: "CryptoBridge" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                var price = findElement(response, "id", element.ticker + "_BTC");
                if (price != undefined) {
                    coin.findOneAndUpdate({ address: element.address }, { price: Number(price.bid).toFixed(8) }, function(err) {
                        if (err) throw err;
                        count = count - 1;
                        if (count == 0) {
                            console.log('CryptoBridge');
                            finished(1);
                        }
                    });
                } else {
                    count = count - 1;
                    console.log('Error CryptoBridge: ' + element.ticker + ' not found');
                    if (count == 0) {
                        console.log('Error CryptoBridge: ' + element.ticker + ' not found');
                        finished(1);
                    }
                }
            });
        } else {
            console.log('Error CryptoBridge');
            finished(1);
        }

    });
}).catch(function(err) {
    console.log('Error CryptoBridge');
    finished(1);
    throw err;
});

//Stocks.Exchange
rp({
    method: 'GET',
    uri: 'https://app.stocks.exchange/api2/ticker',
    json: true
}).then(function(response) {
    coin.find({ exchange: "Stocks.Exchange" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                coin.findOneAndUpdate({ address: element.address }, { price: Number(findElement(response, "market_name", element.ticker + "_BTC").bid).toFixed(8).replace(/\.?0+$/, "") }, function(err) {
                    if (err) throw err;
                    count = count - 1;
                    if (count == 0) {
                        console.log('Stocks.Exchange');
                        finished(1);
                    }
                });
            });
        } else {
            console.log('Error Stocks.Exchange');
            finished(1);
        }
    });
}).catch(function(err) {
    console.log('Error Stocks.Exchange');
    finished(1);
    throw err;
});

//Graviex
rp({
    method: 'GET',
    uri: 'https://graviex.net/api/v2/tickers.json',
    json: true
}).then(function(response) {
    coin.find({ exchange: "Graviex" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                coin.findOneAndUpdate({ address: element.address }, { price: Number(response[element.ticker.toLowerCase() + 'btc'].ticker.buy).toFixed(8).replace(/\.?0+$/, "") }, function(err) {
                    if (err) throw err;
                    count = count - 1;
                    if (count == 0) {
                        console.log('Graviex');
                        finished(1);
                    }
                });
            });
        } else {
            console.log('0 Graviex');
            finished(1);
        }
    });
}).catch(function(err) {
    console.log('Error Graviex');
    finished(1);
    throw err;
});

//safe.trade
rp({
    method: 'GET',
    uri: 'https://safe.trade/api/v2/tickers.json',
    json: true
}).then(function(response) {
    coin.find({ exchange: "Safe.Trade" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                coin.findOneAndUpdate({ address: element.address }, { price: Number(response[element.ticker.toLowerCase() + 'btc'].ticker.buy).toFixed(8).replace(/\.?0+$/, "") }, function(err) {
                    if (err) throw err;
                    count = count - 1;
                    if (count == 0) {
                        console.log('Safe.Trade');
                        finished(1);
                    }
                });
            });
        } else {
            console.log('Error Safe.Trade');
            finished(1);
        }
    });
}).catch(function(err) {
    console.log('Error Safe.Trade');
    finished(1);
    throw err;
});

//CREX24
rp({
    method: 'GET',
    uri: 'https://api.crex24.com/v2/public/tickers',
    json: true
}).then(function(response) {
    coin.find({ exchange: "Crex24" }, function(err, coins) {
        var count = coins.length;
        if (count > 0) {
            coins.forEach(element => {
                var price = findElement(response, "instrument", element.ticker + "-BTC");
                if (price != undefined) {
                    coin.findOneAndUpdate({ address: element.address }, { price: Number(price.bid).toFixed(8) }, function(err) {
                        if (err) throw err;
                        count = count - 1;
                        if (count == 0) {
                            console.log('Crex24');
                            finished(1);
                        }
                    });
                } else {
                    count = count - 1;
                    console.log('Error Crex24: ' + element.ticker + ' not found');
                    if (count == 0) {
                        console.log('Error Crex24: ' + element.ticker + ' not found');
                        finished(1);
                    }
                }
            });
        } else {
            console.log('Error Crex24');
            finished(1);
        }
    });
}).catch(function(err) {
    console.log('Error CryptoBridge');
    finished(1);
    throw err;
});
//Bitso
rp({
    method: 'GET',
    uri: 'https://api.bitso.com/v3/ticker/?book=btc_mxn',
    json: true
}).then(function(response) {
    coin.findOneAndUpdate({ name: "MXN" }, { $set: { price: parseFloat(response.payload.bid).toFixed(2) } }, function(err) {
        if (err) throw err;
        console.log('MXN');
        finished(1);
    });
}).catch(function(err) {
    console.log('Error MXN');
    finished(1);
    throw err;
});

//CMC
rp({
    method: 'GET',
    uri: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
    json: true
}).then(function(response) {
    coin.findOneAndUpdate({ name: "USD" }, { price: parseFloat(response[0].price_usd).toFixed(2) }, function(err) {
        if (err) throw err;
        console.log('USD');
        finished(1);
    });
}).catch(function(err) {
    console.log('Error USD');
    finished(1);
    throw err;
});

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}