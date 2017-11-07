const Storage = require('@google-cloud/storage');
let storage = Storage({
    projectId: 'test-hello-world-175205',
    keyFilename: './configs/key.json'
});
const bucketName = 'kwp-image';
const processedImageBucket = 'kwp-image-processed';
const jsonFileBucketName = 'kwp-json';
const processedImage = 'kwp-processed';

const jsonDownloadDestination = './json/';

const deleteProcessedImageFile = function (filename) {
    storage
        .bucket(bucketName)
        .file(filename)
        .delete()
        .then(() => {
            console.log(`gs://${bucketName}/${filename} deleted.`);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

const moveProcessedImageFile = function(filename){
    console.log('initiating move and delete sequence for : ', filename);
    storage
        .bucket(bucketName)
        .file(filename)
        .copy(storage.bucket(processedImageBucket).file(filename))
        .then(() => {
            console.log(
                `gs://${bucketName}/${filename} copied to gs://${processedImageBucket}/${filename}.`
            );
            deleteProcessedImageFile(filename);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

const copyImage = function(filename){
    storage
        .bucket(bucketName)
        .file(filename)
        .copy(storage.bucket(processedImageBucket).file(filename))
        .then(() => {
            console.log(
                `gs://${bucketName}/${filename} copied to gs://${processedImageBucket}/${filename}.`
            );
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

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

const downloadJson = function (srcFilename, destinationFilename) {
    return new Promise(function (resolve, reject) {
        // let fileName = jsonDownloadDestination + srcFilename;
        const options = {
            destination: destinationFilename,
        };

        // Downloads the file
        storage
            .bucket(jsonFileBucketName)
            .file(srcFilename)
            .download(options)
            .then(() => {
                console.log(`downloaded ${destinationFilename}`);
                resolve('downloaded')
            })
            .catch(err => {
                reject(err);
            });
    })
};

const checkIfFileExists = function (jsonFileName) {
    return new Promise((resolve, reject) => {
        let status = false;
        storage
            .bucket(jsonFileBucketName)
            .getFiles()
            .then(results => {
                const files = results[0];
                files.forEach(file => {
                    if(file.name === jsonFileName) {
                        console.log('json file alread exists in gcp, intiating download sequence');
                        status = true;
                    }
                });
                resolve(status);
            })
            .catch(err => {
                reject(err);
            });
    })
};

// checkIfFileExists('saint.json');

var exports = module.exports = {};

exports.uploadFile = function (fileName) {
    return uploadFile(fileName, bucketName);
};

exports.uploadJsonFile = function (fileName) {
    return uploadFile(fileName, jsonFileBucketName);
};

exports.checkIfFileExists = function (fileName) {
    return checkIfFileExists(fileName);
};

exports.moveProcessedImageFile = function (fileName) {
    return moveProcessedImageFile(fileName);
};

exports.downloadJson = function (fileName, destinationFilename) {
    return downloadJson(fileName, destinationFilename);
};