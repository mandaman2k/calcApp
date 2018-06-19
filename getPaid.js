var rp = require('request-promise');

// Database
var monk = require('monk');
var db = monk('localhost:27017/calc');

var dbCoins = db.get('coins');
var dbMined = db.get('mined');

var count = 0;
var now = new Date(Date.now());
var day = now.getDate() - 1;
var month = now.getMonth() + 1;
var year = now.getFullYear();

var yeseterday = year + "-" + month + "-" + day;
var date = now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }).split(' ')[0];

dbCoins.find({}, {}, function (err, result) {
    if (err) throw err;
    count = result.length;
    result.forEach(coin => {
        if (coin.explorer != undefined && coin.ticker != "BTC") {
            switch (coin.ticker) {
                case "SAFE":
                    rp({
                        method: 'GET',
                        uri: coin.explorer + '/api/addr/' + coin.address + '/?noTxList=1',
                        json: true,
                        followRedirect: true,
                        simple: false
                    }).then(function (response) {

                        count = count - 1;
                        console.log(count + ' ' + coin.name);

                        dbMined.findOne({ name: coin.name }, function (err, result) {
                            if (err) throw err;

                            if (!isNaN(response.balance)) {
                                var lastDayBalance = result[yeseterday];
                                var currBalance = (parseFloat(response.totalReceived).toFixed(8) / 100000000);

                                var balance = currBalance - lastDayBalance;

                                dbMined.update({ name: coin.name }, { $set: { "name": coin.name, [date]: currBalance } }, { upsert: true }, function (err) {
                                    if (err) throw err;
                                    if (count == 0) {
                                        db.close();
                                    }
                                })
                            } else {
                                if (count == 0) {
                                    db.close();
                                }
                            }
                        });
                    }).catch(function (err) {
                        count = count - 1;
                        console.log('Err: ' + count + ' ' + coin.name);
                        if (count == 0) {
                            db.Close();
                        }
                        throw err;
                    });
                    break;

                case "RVN":
                    rp({
                        method: 'GET',
                        uri: coin.explorer + '/api/addr/' + coin.address,
                        json: true,
                        followRedirect: true,
                        simple: false
                    }).then(function (response) {
                        count = count - 1;
                        console.log(count + ' ' + coin.name);

                        dbMined.findOne({ name: coin.name }, function (err, result) {
                            if (err) throw err;

                            if (!isNaN(response.balance)) {
                                var lastDayBalance = result[yeseterday];
                                var currBalance = parseFloat(response.totalRecieved).toFixed(8);

                                var balance = lastDayBalance - currBalance;

                                dbMined.update({ name: coin.name }, { $set: { "name": coin.name, [date]: balance } }, { upsert: true }, function (err) {
                                    if (err) throw err;
                                    if (count == 0) {
                                        db.close();
                                    }
                                });
                            } else {
                                if (count == 0) {
                                    db.close();
                                }
                            }
                        });
                    }).catch(function (err) {
                        count = count - 1;
                        console.log(count + ' ' + coin.name);
                        if (count == 0) {
                            db.close();
                        }
                        throw err;
                    });
                    break;

                default:
                    rp({
                        method: 'GET',
                        uri: coin.explorer + '/ext/getaddress/' + coin.address,
                        json: true,
                        followRedirect: true,
                        simple: false
                    }).then(function (response) {
                        count = count - 1;
                        console.log(count + ' ' + coin.name);
                        dbMined.findOne({ name: coin.name }, function (err, result) {
                            if (err) throw err;

                            if (!isNaN(response.balance)) {
                                var lastDayBalance = result[yeseterday];
                                var currBalance = parseFloat(response.received).toFixed(8);

                                var balance = lastDayBalance - currBalance;

                                dbMined.update({ name: coin.name }, { $set: { "name": coin.name, [yeseterday]: currBalance } }, { upsert: true }, function (err) {
                                    if (err) throw err;
                                    if (count == 0) {
                                        db.close();
                                    }
                                })
                            } else {
                                if (count == 0) {
                                    db.close();
                                }
                            }
                        });
                    }).catch(function (err) {
                        count = count - 1;
                        console.log('Error: ' + count + ' ' + coin.name);
                        if (count == 0) {
                            db.close();
                        }
                        throw err;
                    });
                    break;
            }
        } else {
            count = count - 1;
            console.log(count + ' ' + coin.name);
            if (count == 0) {
                db.close();
            }
        }
    });
});

