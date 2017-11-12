// Performs text detection on the gcp file
var vision = require('@google-cloud/vision');
var visionClient = vision({
    projectId: 'test-hello-world-175205',
    keyFilename: './configs/key.json'
});

const getVisionText = function (fileName, bucketN) {

    let gcsImageUri = 'gs://kwp-image/' + fileName;

    if(bucketN) {
        gcsImageUri = 'gs://' + bucketN + '/' + fileName;
    }
    let source = {
        gcsImageUri : gcsImageUri
    };
    let image = {
        source : source
    };
    let type = vision.v1.types.Feature.Type.TEXT_DETECTION;
    let featuresElement = {
        type : type , maxResults : 50
    };
    let features = [featuresElement];
    let requestsElement = {
        image : image,
        features : features,
        imageContext : {languageHints:['en']}
    };
// {cropHintsParams: {aspectRatios: [0.8, 1, 1.2]}}
    let requests = [requestsElement];

    return new Promise(function (resolve, reject) {
        visionClient.batchAnnotateImages({requests: requests}).then(function(responses) {
            // console.log(responses[0]);
            resolve(responses);
        })
        .catch(function(err) {
            reject(err);
        });
    })
};


var exports = module.exports = {};

exports.getVisionText = function (fileName, bucketN) {
    return getVisionText(fileName, bucketN);
};