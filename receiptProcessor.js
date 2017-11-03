/**
 * Created by nirojans on 9/1/17.
 */
const fs = require("fs");
const deepcopy = require("deepcopy");
const _ = require('lodash');

const content = fs.readFileSync("./json/bu.json");
const textJson = JSON.parse(content);

const receiptHelper = require('./receipt-helper');
const accuracyHelper = require('./accuracyHelper');
const coordinatesHelper = require('./coordinatesHelper');
const mongoHelper = require('./mongoHelper');

extractReceiptData(textJson);

function extractReceiptData(data) {
    mergeWords(data);
}

function getYMax(data) {
    let v = data.textAnnotations[0].boundingPoly.vertices;
    let yArray = [];
    for(let i=0; i <4; i++){
        yArray.push(v[i]['y']);
    }
    return Math.max.apply(null, yArray);
}


function getLines(mergedWordsArray) {
    let lines = [];
    for(let i=0; i< mergedWordsArray.length; i++) {
        lines.push(mergedWordsArray[i]['description']);
    }
    return lines;
}

function mergeWords(data) {
    const yMax = getYMax(textJson);
    data = coordinatesHelper.invertAxis(data, yMax);

    // Auto identified and merged lines from gcp vision
    let lines = data.textAnnotations[0].description.split('\n');
    // gcp vision full text
    let rawText = deepcopy(data.textAnnotations);

    // reverse to use lifo, because array.shift() will consume 0(n)
    lines = lines.reverse();
    rawText = rawText.reverse();
    // to remove the zeroth element which gives the total summary of the text
    rawText.pop();

    let mergedArray = getMergedLines(lines, rawText);
    coordinatesHelper.getBigbb(mergedArray);
    coordinatesHelper.combineBB(mergedArray);

    // This does the line segmentation based on the bounding boxes
    let finalArray = getLineWithBB(mergedArray);

    // console.log(getLines(mergedArray));
    // console.log(finalArray);

    // let lineItemList = regexToGetDescriptionAndPrice(getLines(mergedArray));
    let itemList = receiptHelper.regexToGetDescriptionAndPrice(finalArray);

    let receipt = receiptHelper.generateEmptyReceipt();
    receipt.shopName = receiptHelper.getShopName(finalArray);
    accuracyHelper.calculateAccuracyForLineItems(deepcopy(itemList), deepcopy(itemList), receipt);
    // calculate accuracy for shop name and total
    mongoHelper.saveReceipt(receipt);

    console.log('test');
}

// TODO implement the line ordering
function getLineWithBB(mergedArray) {
    let finalArray = [];

    for(let i=0; i< mergedArray.length; i++) {
        if(!mergedArray[i]['matched']){
            if(mergedArray[i]['match'].length === 0){
                finalArray.push(mergedArray[i].description)
            }else{
                let index = mergedArray[i]['match'][0]['matchLineNum'];
                let secondPart = mergedArray[index].description;
                finalArray.push(mergedArray[i].description + ' ' +secondPart);
            }
        }
    }
    return finalArray;
}

function getMergedLines(lines,rawText) {
    let mergedArray = [];
    while(lines.length !== 1) {
        let l = lines.pop();
        let l1 = deepcopy(l);
        let status = true;

        let data = "";
        let mergedElement;

        while (true) {
            let wElement = rawText.pop();
            if(wElement === undefined) {
                break;
            }
            let w = wElement.description;

            let index = l.indexOf(w);
            let temp;
            // check if the word is inside
            l = l.substring(index + w.length);
            if(status) {
                status = false;
                // set starting coordinates
                mergedElement = wElement;
            }
            if(l === ""){
                // set ending coordinates
                mergedElement.description = l1;
                mergedElement.boundingPoly.vertices[1] = wElement.boundingPoly.vertices[1];
                mergedElement.boundingPoly.vertices[2] = wElement.boundingPoly.vertices[2];
                mergedArray.push(mergedElement);
                break;
            }
        }
    }
    return mergedArray;
}


var exports = module.exports = {};

exports.processReceipt = function (jsonData) {
    return extractReceiptData(jsonData);
};