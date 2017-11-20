const MongoClient = require('mongodb').MongoClient;
const tescoCollectionName = 'tesco';
const saintsCollectionName = 'sainsbury';
// Connection URL
// const url = 'mongodb://localhost:27017/kwp';
const url = 'mongodb://kwp2:kwp2@35.184.131.227:27017/kwp';
// const url = 'mongodb://35.184.131.227:27017/kwp';

// Use connect method to connect to the Server
let saveReceipt = function (receipt, collectionName) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, function (err, db) {
            let collection = db.collection(collectionName);
            collection.insert(receipt, function (err, result) {
                // console.log('inserted the receipt');
                if(err === null) {
                    resolve(result);
                }
            });
            db.close();
        });
    })
};

let getManualReceiptData = function (receiptId, collectionName) {
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


const getManualReceipt = (receiptId) => {
    return new Promise((resolve, reject) => {
        getManualReceiptData(receiptId, tescoCollectionName).then((tescoResponse) => {
            if(tescoResponse.length === 0){
                getManualReceiptData(receiptId, saintsCollectionName).then((saintsResponse) => {
                    // console.log('saits reponse' + saintsResponse);
                    resolve(saintsResponse);
                });
            }else {
                // console.log('response found in tesco' + tescoResponse);
                resolve(tescoResponse);
            }

        }).catch(function (err) {
            console.log('error occurred while connecting to db to get manual receipt', err);
        });
    });
};

// getManualReceipt('S01200HQQ2D3');
// getManualReceipt('S01200HQQ2FB');

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

exports.saveReceipt = function (receipt, collectionName) {
    return saveReceipt(receipt, collectionName);
};

exports.getManualReceipt = function (receiptId) {
    return getManualReceipt(receiptId);
};

// '30.00'.replace(/^0+|0+$/g, "")
