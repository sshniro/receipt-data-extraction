const Storage = require('@google-cloud/storage');
let storage = Storage({
    projectId: 'test-hello-world-175205',
    keyFilename: './configs/key.json'
});
const bucketName = 'kwp-image';
const jsonFileBucketName = 'kwp-json';
const processedImage = 'kwp-processed';

const uploadFile = function (fileName, bucketName) {
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

const checkIfFileExists = function (jsonFileName) {
    return new Promise(function (resolve, reject) {
        storage
            .bucket(jsonFileBucketName)
            .getFiles()
            .then(results => {
                const files = results[0];

                console.log('Files:');
                files.forEach(file => {
                    console.log(file.name);
                    if(file.name === jsonFileName) {
                        console.log('same file has been found');
                    }
                });
                resolve(files);
            })
            .catch(err => {
                reject(err);
            });
    })
};



var exports = module.exports = {};

exports.uploadFile = function (fileName) {
    return uploadFile(fileName, bucketName);
};

exports.jsonFile = function (fileName) {
    return uploadFile(fileName, jsonFileBucketName);
};

exports.checkIfFileExists = function (fileName) {
    return uploadFile(fileName);
};