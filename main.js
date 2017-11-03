var inside = require('point-in-polygon');
var polygon = [[ 1, 1430], [ 1000, 1413],[ 1000, 1367], [1, 1383]];

var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/kwp';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server");
    // insertDocuments(db, function () {
    //     console.log('inserted')
    // });

    // findDocuments(db, function () {
    //     console.log('inserted')
    // });

    saveReceipt(db, {}, function () {
        console.log('done');
    });
    db.close();
});

var saveReceipt = function (db, receipt, cb) {
    var collection = db.collection('ocr');
    // Insert some documents
    collection.insert( {name : 'test image'}, function(err, result) {
        console.log("Inserted 3 documents into the document collection");
        cb(result);
    });
}


var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        // assert.equal(err, null);
        // assert.equal(3, result.result.n);
        // assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the document collection");
        callback(result);
    });
};

var findDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        // assert.equal(err, null);
        // assert.equal(2, docs.length);
        console.log("Found the following records");
        console.dir(docs);
        callback(docs);
    });
};