var Request = require("request");
var rp = require('request-promise');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/calc');

var coins = db.get('coins');

coins.find({}).each((coin, { close, pause, resume }) => {
    rp({
        method: 'GET',
        uri: coin.explorer + '/ext/getaddress/' + coin.address,
        json: true
    }).then(function (response) {
        coins.findOneAndUpdate({ address: coin.address }, { $set: { "balance": response.balance } }, function (err, doc, next) {
            //console.log(err);
            console.log(doc);
            db.close();
        });
    }).catch(function (err) {
        throw err;
    });
}).then(() => {
    console.log('end');
    // stream is over
});