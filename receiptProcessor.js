/**
 * Created by nirojans on 9/1/17.
 */
const fs = require("fs");
const deepcopy = require("deepcopy");
const _ = require('lodash');

// const content = fs.readFileSync("./json/S01200HS22A9.jpeg.json");
// const textJson = JSON.parse(content);

const receiptHelper = require('./receipt-helper');
const accuracyHelper = require('./accuracyHelper');
const coordinatesHelper = require('./coordinatesHelper');
const mongoHelper = require('./mongoHelper');
const htmlHelper = require('./helpers/helper.js');

// extractReceiptData(textJson[0]['responses'][0], 'S01200HS22A9').then((receipt) => {
//     console.log(receipt);
// }).catch((err) => {
//     console.log(err);
// });

function extractReceiptData(data, receiptId) {
    return mergeWords(data, receiptId);
}

function mergeWords(data, receiptId) {
    return new Promise((resolve, reject) => {
        const yMax = coordinatesHelper.getYMax(data);
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

        let receipt = receiptHelper.generateEmptyReceipt(receiptId);

        receipt.stage1 = getLines(mergedArray);
        receipt.stage2 = finalArray;


        receipt.shopName = receiptHelper.getShopName(finalArray);
        receipt.totalVal = receiptHelper.getTotal(finalArray);
        let itemList = receiptHelper.regexToGetDescriptionAndPrice(deepcopy(finalArray));

        mongoHelper.getManualReceipt(receiptId).then((manualData) => {
            if(manualData.length === 0){
                console.log('no records have been found in the db');
                generateFinalReceiptWithOCRdata(receipt, itemList);
            }else{
                let manualReceipt = receiptHelper.createReceiptFromManualData(manualData);
                receipt.isVerified = true;
                receipt.manualReceipt = manualReceipt;
                accuracyHelper.calculateAccuracyForLineItems(deepcopy(itemList), deepcopy(manualReceipt.lineItems), receipt);
                accuracyHelper.calculateAccuracyForShopName(receipt, manualReceipt);
                accuracyHelper.calculateAccuracyTotalVal(receipt, manualReceipt);
                accuracyHelper.computeReceiptAccuracy(receipt);
            }
            resolve(receipt);
            mongoHelper.saveReceipt(receipt, 'gcpResults');
        });

    });
}

function calculateAccuracyForAzure(receiptId, lines) {

    return new Promise((resolve, reject) => {
        let receipt = receiptHelper.generateEmptyReceipt(receiptId);
        receipt.shopName = receiptHelper.getShopName(lines);
        receipt.totalVal = receiptHelper.getTotal(lines);
        let itemList = receiptHelper.regexToGetDescriptionAndPrice(lines, true);

        receipt.stage1 = lines;

        mongoHelper.getManualReceipt(receiptId).then((manualData) => {
            if(manualData.length === 0){
                console.log('no records have been found in the db');
                generateFinalReceiptWithOCRdata(receipt, itemList);
            }else{
                let manualReceipt = receiptHelper.createReceiptFromManualData(manualData);
                receipt.isVerified = true;
                receipt.manualReceipt = manualReceipt;
                accuracyHelper.calculateAccuracyForLineItems(deepcopy(itemList), deepcopy(manualReceipt.lineItems), receipt);
                accuracyHelper.calculateAccuracyForShopName(receipt, manualReceipt);
                accuracyHelper.calculateAccuracyTotalVal(receipt, manualReceipt);
                accuracyHelper.computeReceiptAccuracy(receipt);
            }
            resolve(receipt);
            mongoHelper.saveReceipt(receipt, 'azureResults');
        });
    });
}

function generateFinalReceiptWithOCRdata(receipt, lineItemList) {
    let lineItemStat = [];
    for(let i=0; i<lineItemList.length; i++){
        let line = lineItemList[i];
        let statLineItem = {
            real : {line: i,desc: '-', price: '-'},
            ocr : {desc: line.desc, price: line.price} ,
            descAccuracy: '-',
            priceAccuracy  : '-',
            accuracy : '-'
        };
        lineItemStat.push(statLineItem);
    }
    receipt.lineItemStat = lineItemStat;
    return receipt;
}

function getLines(mergedWordsArray) {
    let lines = [];
    for(let i=0; i< mergedWordsArray.length; i++) {
        lines.push(mergedWordsArray[i]['description']);
    }
    return lines;
}

// TODO implement the line ordering for multiple words
function getLineWithBB(mergedArray) {
    let finalArray = [];

    for(let i=0; i< mergedArray.length; i++) {
        if(!mergedArray[i]['matched']){
            if(mergedArray[i]['match'].length === 0){
                finalArray.push(mergedArray[i].description)
            }else{
                // arrangeWordsInOrder(mergedArray, i);
                // let index = mergedArray[i]['match'][0]['matchLineNum'];
                // let secondPart = mergedArray[index].description;
                // finalArray.push(mergedArray[i].description + ' ' +secondPart);
                finalArray.push(arrangeWordsInOrder(mergedArray, i));
            }
        }
    }
    return finalArray;
}

function arrangeWordsInOrder(mergedArray, k) {
    let mergedLine = '';
    let wordArray = [];
    let line = mergedArray[k]['match'];
    // [0]['matchLineNum']
    for(let i=0; i < line.length; i++){
        let index = line[i]['matchLineNum'];
        let matchedWordForLine = mergedArray[index].description;

        let mainX = mergedArray[k].boundingPoly.vertices[0].x;
        let compareX = mergedArray[index].boundingPoly.vertices[0].x;

        if(compareX > mainX) {
            mergedLine = mergedArray[k].description + ' ' + matchedWordForLine;
        }else {
            mergedLine = matchedWordForLine + ' ' + mergedArray[k].description;
        }
    }
    return mergedLine;
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

function generateHtmlForReceipt(receipt, receiptName) {
    let lineItemStat = receipt.lineItemStat;
    let lineItem;
    let htmlString = "";
    let sep = ' | ';

    let pStartTag = '<p>';
    let pEndTag = '</p>';

    let tableStartTag = '<table>';
    let tableEndTag = '</table>';

    let trSTag = '<tr>';
    let trETag = '</tr>';

    let thSTag = '<th>';
    let thETag = '</th>';

    let tdSTag = '<td>';
    let tdETag = '</td>';

    if(receipt.isVerified) {
        let manualReceipt = receipt.manualReceipt;
        htmlString = htmlString + pStartTag + 'Receipt Name : ' + receiptName + pEndTag;
        htmlString = htmlString + pStartTag + 'Receipt Accuracy : ' + receipt.accuracy +pEndTag;
        htmlString = htmlString + pStartTag + 'Identified Shop Name : ' + receipt.shopName + sep +
            ' Real Shop Name : ' + manualReceipt.shopName + sep +
            ' accuracy : ' + receipt.shopAccuracy + pEndTag;
        htmlString = htmlString + pStartTag + 'Identified Receipt Total : ' + receipt.totalVal + sep +
            ' Real Total : ' + manualReceipt.total + sep +
            ' accuracy : ' + receipt.totalValAccuracy + pEndTag;
        htmlString = htmlString + pStartTag + 'Line Item Accuracy : ' + receipt.lineItemAccuracy + pEndTag;
    }else{
        htmlString = htmlString + pStartTag + 'Manual Data not available to compute accuracy' + pEndTag;
        htmlString = htmlString + pStartTag + 'Shop Name : ' + receipt.shopName + pEndTag;
        htmlString = htmlString + pStartTag + 'Receipt Total : ' + receipt.totalVal + pEndTag;
    }


    htmlString = htmlString + tableStartTag +
        trSTag +
        thSTag + 'Line No.' + thETag +
        thSTag + 'Real Desc' + thETag +
        thSTag + 'OCR Desc' + thETag +
        thSTag + 'Desc Accuracy' + thETag +
        thSTag + 'Real Price' + thETag +
        thSTag + 'OCR Price' + thETag +
        thSTag + 'Price Accuracy' + thETag +
        thSTag + 'Total Accuracy' + thETag +
        trETag;

    for (let i=0; i<lineItemStat.length; i++) {
        lineItem = lineItemStat[i];

        let lineNum = lineItem.real.line;
        let realDesc = lineItem.real.desc;
        let realPrice = lineItem.real.price;
        let ocrDesc = lineItem.ocr.desc;
        let ocrPrice = lineItem.ocr.price;
        let descAccuracy = lineItem.descAccuracy;
        let priceAccuracy = lineItem.priceAccuracy;
        let accuracy = lineItem.accuracy;

        // let lineStatString = pStartTag + realDesc + sep + ocrDesc + sep + descAccuracy + sep +
        //     realPrice + sep + ocrPrice + sep + priceAccuracy + sep + accuracy + pEndTag;

        let lineStatString = trSTag +
            tdSTag + lineNum + tdETag +
            tdSTag + realDesc + tdETag +
            tdSTag + ocrDesc + tdETag +
            tdSTag + descAccuracy + tdETag +
            tdSTag + realPrice + tdETag +
            tdSTag + ocrPrice + tdETag +
            tdSTag + priceAccuracy + tdETag +
            tdSTag + accuracy + tdETag +
            trETag;

        htmlString = htmlString + lineStatString;
    }

    htmlString = htmlString + tableEndTag;
    htmlString = htmlString + htmlHelper.generateAlgorithmOutPutTable(receipt);

    return htmlString;
}

var exports = module.exports = {};

exports.processReceipt = function (jsonData, receiptId) {
    return extractReceiptData(jsonData, receiptId);
};

exports.calculateAccuracyForAzure = function (receiptId, lines) {
    return calculateAccuracyForAzure(receiptId, lines);
};

exports.generateHtmlForReceipt = function (receipt, receiptName) {
    return generateHtmlForReceipt(receipt, receiptName);
};