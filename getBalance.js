var Request = require("request");
var rp = require('request-promise');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/calc');

mongoose.Promise = global.Promise;

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

var coinModel = mongoose.model('coins', coinSchema);

var coin = coinModel;

var count;

coin.find({}, function (err, coins) {
    if (err) throw err;
    count = coins.length;
    coins.forEach(element => {
        rp({
            method: 'GET',
            uri: element.explorer + '/ext/getaddress/' + element.address,
            json: true,
            followRedirect: true,
            simple: false
        }).then(function (response) {
            count = count - 1;
            console.log(count + ' ' + element.name);
            coin.findOne({ address: element.address }, function (err, result) {
                if (err) throw err;

                if (!isNaN(response.balance)) {
                    result.balance = parseFloat(response.balance).toFixed(8);

                    result.save(function (err) {
                        if (err) throw err;
                        if (count == 0) {
                            mongoose.disconnect();
                        }
                    });
                } else {
                    if (count == 0) {
                        mongoose.disconnect();
                    }
                }
            });
        }).catch(function (err) {
            count = count - 1;
            console.log(count + ' ' + element.name);
            if (count == 0) {
                mongoose.disconnect();
            }
            throw err;
        });
    });
});