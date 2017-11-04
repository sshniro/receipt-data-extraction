'use strict';

const express = require('express');
const fs = require('fs');
const util = require('util');
const mime = require('mime');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const jsonfile = require('jsonfile');

const visionHelper = require('./helpers/vision-helper');
const storageHelper = require('./helpers/storage-helper');
const receiptProcessor = require('./receiptProcessor');

const app = express();

app.post('/upload', upload.single('image'), function (req, res, next) {
    let filename = req.file.path;
    let rename = 'uploads/' + req.file.originalname;
    let originalFileName =  req.file.originalname;
    let fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf('.'));

    // check if json results exists


    // else upload and save the json to google storage
    fs.rename(filename, rename, function (err) {
        storageHelper.uploadFile(rename).then(function (storageResponse) {
            console.log(storageResponse);
            visionHelper.getVisionText(originalFileName).then(function (visionResponse) {
                console.log('vision api request success', visionResponse);
                let jsonFile = 'uploads/' + originalFileName + '.json';

                let receipt = receiptProcessor.processReceipt(visionResponse[0]['responses'][0], fileNameWithoutExtension);

                jsonfile.writeFile(jsonFile, visionResponse, function (err) {

                    res.writeHead(200, {
                    'Content-Type': 'text/html'
                    });
                    res.write('<!DOCTYPE HTML><html><body>');

                    // Base64 the image so we can display it on the page
                    res.write('<img width=200 src="' + base64Image(rename) + '"><br>');

                    // Write out the JSON output of the Vision API
                    res.write(JSON.stringify(visionResponse[0]['responses'][0]['fullTextAnnotation']['text']));

                    // Delete file (optional)
                    fs.unlinkSync(rename);

                    res.end('</body></html>');

                    // console.log('error in saving json file to local file system');
                })
            }).catch(function () {
                console.log('error occurred in the vision api text extraction');
            })
        }).catch(function (err) {
            console.log('error');
        })
    });

});


// Simple upload formt
var form = '<!DOCTYPE HTML><html><body>' +
    "<form method='post' action='/upload' enctype='multipart/form-data'>" +
    "<input type='file' name='image'/>" +
    "<input type='submit' /></form>" +
    '</body></html>';

app.get('/', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(form);
});

app.listen(8080);
console.log('Server Started on port 8080');

function base64Image(src) {
    let data = fs.readFileSync(src).toString('base64');
    return util.format('data:%s;base64,%s', mime.lookup(src), data);
}