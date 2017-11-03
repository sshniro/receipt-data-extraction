const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017/kwp';

// Use connect method to connect to the Server
let saveReceipt = function (receipt) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, function (err, db) {
            let collection = db.collection('ocr');
            collection.insert(receipt, function (err, result) {
                console.log('inserted the receipt');
                if(err === null) {
                    resolve(result);
                }
            });
            db.close();
        });
    })
};

let getManualReceipt = function (receiptId) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, function (err, db) {
            let collection = db.collection('ocr');
            collection.find({id: receiptId}).toArray(function(err, docs) {
                if(err === null) {
                    resolve(docs);
                }
            });
            db.close();
        });
    })
};


var exports = module.exports = {};

exports.saveReceipt = function (receipt) {
    return saveReceipt(receipt);
};

exports.getManualReceipt = function (receiptId) {
    return getManualReceipt(receiptId);
};
