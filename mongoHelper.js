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

let getManualReceipt = function (receiptId, collectionName) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, function (err, db) {
            let collection = db.collection(collectionName);
            collection.find({'TILLROLL_DOC_ID': receiptId}).toArray(function(err, docs) {
                if(err === null) {
                    resolve(docs);
                }
            });
            db.close();
        });
    })
};

// getManualReceipt('S01200HQQ2D3', 'tesco').then(function (response) {
//     console.log(response);
// }).catch(function (err) {
//     console.log(err);
// });

function createReceipt(lineItemsArray) {
    let receipt;
    let lineItems = [];
    for(let i=0; i< lineItemsArray.length; i++){
        lineItems.push(
            {line: lineItemsArray[i]['TILLROLL_LINE_NUMBER']},
            {desc:lineItemsArray[i]['TILLROLL_LINE_DESC'],
            price: lineItemsArray[i]['LINE_PRICE']})
    }
    receipt.lineItems = lineItems;
    receipt.name = lineItemsArray[0]['SHOP_NAME'];
    receipt.total = lineItemsArray[0]['TILLROLL_RECORDED_SPEND'];
    return receipt;
}


var exports = module.exports = {};

exports.saveReceipt = function (receipt) {
    return saveReceipt(receipt);
};

exports.getManualReceipt = function (receiptId, collectionName) {
    return getManualReceipt(receiptId);
};

// '30.00'.replace(/^0+|0+$/g, "")
