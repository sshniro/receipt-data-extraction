const Storage = require('@google-cloud/storage');
var storage = Storage({
    projectId: 'test-hello-world-175205',
    keyFilename: './configs/key.json'
});
const bucketName = 'kwp-image';

const uploadFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        storage
            .bucket(bucketName)
            .upload(fileName)
            .then(() => {
                console.log(`${fileName} uploaded to ${bucketName}.`);
                resolve('success');
            })
            .catch(err => {
                console.error('ERROR:', err);
                reject(err);
            });
    })
};

var exports = module.exports = {};

exports.uploadFile = function (fileName) {
    return uploadFile(fileName);
};