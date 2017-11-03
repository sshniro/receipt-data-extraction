// Performs text detection on the gcp file
var vision = require('@google-cloud/vision');
var visionClient = vision({
    projectId: 'test-hello-world-175205',
    keyFilename: 'key.json'
});

const getVisionText = function (fileName) {

    var gcsImageUri = 'gs://kwp-image/' + fileName;
    var source = {
        gcsImageUri : gcsImageUri
    };
    var image = {
        source : source
    };
    var type = vision.v1.types.Feature.Type.TEXT_DETECTION;
    var featuresElement = {
        type : type , maxResults : 50
    };
    var features = [featuresElement];
    var requestsElement = {
        image : image,
        features : features,
        imageContext : {languageHints:['en']}
    };
// {cropHintsParams: {aspectRatios: [0.8, 1, 1.2]}}
    var requests = [requestsElement];

    console.log('vision request object', requests);

    return new Promise(function (resolve, reject) {
        visionClient.batchAnnotateImages({requests: requests}).then(function(responses) {
            console.log(responses[0]);
            resolve(responses);
        })
        .catch(function(err) {
            reject(err);
        });

    })
};


var exports = module.exports = {};

exports.getVisionText = function (fileName) {
    return getVisionText(fileName);
};