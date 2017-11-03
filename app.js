/**
 * Created by nirojans on 9/1/17.
 */
const fs = require("fs");
const deepcopy = require("deepcopy");
const inside = require('point-in-polygon');
const content = fs.readFileSync("bu.json");
const levenshtein = require('fast-levenshtein');
const _ = require('lodash');
const textJson = JSON.parse(content);

mergeWords(textJson);

function getYMax(data) {
    let v = data.textAnnotations[0].boundingPoly.vertices;
    let yArray = [];
    for(let i=0; i <4; i++){
        yArray.push(v[i]['y']);
    }
    return Math.max.apply(null, yArray);
}

function invertAxis(data, yMax) {
    for(var i=1; i < data.textAnnotations.length; i++ ){
        let v = data.textAnnotations[i].boundingPoly.vertices;
        let yArray = [];
        for(let j=0; j <4; j++){
            v[j]['y'] = (yMax - v[j]['y']);
        }
    }
    return data;
}

function getLines(mergedWordsArray) {
    let lines = [];
    for(let i=0; i< mergedWordsArray.length; i++) {
        lines.push(mergedWordsArray[i]['description']);
    }
    return lines;
}

function regexToGetDescriptionAndPrice(lines) {
    let lineItemList = [];
    let lineItem = {desc: "", price: ""};
    for(let i=0; i < lines.length; i++) {
        let line = lines[i];
        let match = /(.+)(£|€|\$)(\d+\.\d{2})/.exec(line);
        if(match !== null) {
            lineItemList.push({desc: match[1], price: match[3]})
        }
    }
    return lineItemList;
}

function mergeWords(data) {
    var yMax = getYMax(textJson, yMax);
    data = invertAxis(data, yMax);
    var lines = data.textAnnotations[0].description.split('\n');
    let rawText = deepcopy(data.textAnnotations);

    // because array.shift() will consume 0(n)
    lines = lines.reverse();
    rawText = rawText.reverse();
    // to remove the zeroth element
    rawText.pop();

    let mergedArray = getMergedLines(lines, rawText);
    // let results = inside([1998, 230], rect);
    getBigbb(mergedArray);
    combineBB(mergedArray);
    let finalArray = getLineWithBB(mergedArray);
    console.log(getLines(mergedArray));
    console.log(finalArray);
    // connect rectangles by big bb

    // let lineItemList = regexToGetDescriptionAndPrice(getLines(mergedArray));
    let lineItemList1 = regexToGetDescriptionAndPrice(finalArray);
    let receipt = generateEmptyReceipt();
    let shopName = getShopName(finalArray);
    calculateAccuracyForLineItems(deepcopy(lineItemList1), deepcopy(lineItemList1), receipt);
    // calculate accuracy for shop name and total
    console.log('test');
}

function getShopName(lines) {
    let shopIdentifier = [];

    let tescoIdentifier = {name: 'tesco', identifier: ['tesco']};
    let saintIdentifier = {name: 'Sainsbury', identifier: ['Sainsbury']};

    shopIdentifier.push(tescoIdentifier);
    shopIdentifier.push(saintIdentifier);

    let status = false;
    let line;
    let shopName = null;

    for(let i=0; i < shopIdentifier.length; i++){
        if(!status){
            for(let j=0; j< shopIdentifier[i]['identifier'].length; j++){
                let identifier = shopIdentifier[i]['identifier'][j];

                for(let k=0; k < shopIdentifier.length; k++){
                    line = lines[k];
                    let rgxp = new RegExp(identifier, 'i');
                    let result = line.match(rgxp);
                    if(result){
                        status = true;
                        shopName = shopIdentifier[i]['name'];
                        break;
                    }
                }
            }
        }
    }
    return shopName;
}

function generateEmptyReceipt() {
    let receipt = {
        shopName: '',
        shopAccuracy: 0,
        lineItemStat: [],
        lineItemAccuracy: 0,
        totalVal: '',
        totalValAccuracy: 0,
        receiptAccuracy: 0
    };

    return receipt;
}

function calculateAccuracyForLineItems(ocrLineItems, realLineItemsClone, receipt) {
    let lineItemStat = [];
    let realLineItems = deepcopy(realLineItemsClone);


    for(let i=0; i< ocrLineItems.length; i++){
        let descScoreList  = [];
        let priceScoreList  = [];

        for(let j=0; j<realLineItems.length; j++){
            descScoreList.push(levenshtein.get(ocrLineItems[i].desc, realLineItems[j].desc));
            priceScoreList.push(levenshtein.get(ocrLineItems[i].price, realLineItems[j].price));
        }

        let index = _.indexOf(descScoreList, _.min(descScoreList));
        let descScore = descScoreList[index];

        let wordLen = ocrLineItems[i]['desc'].length;
        let descPercentage = Math.round(((wordLen - descScore) / wordLen)*100);
        let pricePercentage = Math.round(((wordLen - descScore) / wordLen)*100);

        if(descPercentage > 40){
            let statLineItem = {real : deepcopy(realLineItems[index]),
                ocr : ocrLineItems[i] ,
                descAccuracy: descPercentage ,
                priceAccuracy : pricePercentage,
                accuracy : computeLineItemAccuracyWithWeights(descPercentage, pricePercentage)
            };
            lineItemStat.push(statLineItem);
            realLineItems.splice(index, 1);
        }
    }

    // If there are unidentified
    for(let j=0; j<realLineItems.length; j++){
        let statLineItem = {real : deepcopy(realLineItems[index]),
            ocr : ocrLineItems[i] ,
            descAccuracy: 0,
            priceAccuracy  : 0,
            accuracy : 0
        };
        lineItemStat.push(statLineItem);
    }

    receipt.lineItemStat = lineItemStat;
    receipt.lineItemAccuracy = computeTotalLineItemAccuracy(receipt);
    return receipt;
}

function computeLineItemAccuracyWithWeights(descPercentage, pricePercentage) {
    let descW = 0.90;
    let priceW = 0.10;

    return Math.round((descPercentage * descW) + (pricePercentage * priceW))
}

function computeTotalLineItemAccuracy(receipt) {
    let lineItemStat = receipt.lineItemStat;
    let totalAccuracy = 0;

    for(let i=0;i< lineItemStat.length; i++){
        totalAccuracy = totalAccuracy + lineItemStat[i].accuracy;
    }

    return Math.round(totalAccuracy / lineItemStat.length);
}

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


function combineBB(mergedArray) {
    // select one word from the array
    for(let i=0; i< mergedArray.length; i++) {

        let bigBB = mergedArray[i]['bigbb'];

        // iterate through all the array to find the match
        for(let k=i; k< mergedArray.length; k++) {
            // Do not compare with the own bounding box and which was not matched with a line
            if(k !== i && mergedArray[k]['matched'] === false) {
                let insideCount = 0;
                for(let j=0; j < 4; j++) {
                    let coordinate = mergedArray[k].boundingPoly.vertices[j];
                    if(inside([coordinate.x, coordinate.y], bigBB)){
                        insideCount += 1;
                    }
                }
                // all four point were inside the big bb
                if(insideCount === 4) {
                    let match = {matchCount: insideCount, matchLineNum: k};
                    mergedArray[i]['match'].push(match);
                    mergedArray[k]['matched'] = true;
                }

            }
        }
    }
}

function getBigbb(mergedArray) {

    for(let i=0; i< mergedArray.length; i++) {
        let arr = [];

        // calculate line height
        let h1 = mergedArray[i].boundingPoly.vertices[0].y - mergedArray[i].boundingPoly.vertices[3].y;
        let h2 = mergedArray[i].boundingPoly.vertices[1].y - mergedArray[i].boundingPoly.vertices[2].y;
        let h = h1;
        if(h2> h1) {
            h = h2
        }
        let avgHeight = h * 0.4;

        arr.push(mergedArray[i].boundingPoly.vertices[1]);
        arr.push(mergedArray[i].boundingPoly.vertices[0]);
        let line1 = getRectangle(deepcopy(arr), true, avgHeight, true);

        arr = [];
        arr.push(mergedArray[i].boundingPoly.vertices[2]);
        arr.push(mergedArray[i].boundingPoly.vertices[3]);
        let line2 = getRectangle(deepcopy(arr), true, avgHeight, false);

        mergedArray[i]['bigbb'] = createRectCoordinates(line1, line2);
        mergedArray[i]['lineNum'] = i;
        mergedArray[i]['match'] = [];
        mergedArray[i]['matched'] = false;
    }

}

function getRectangle(v, isRoundValues, avgHeight, isAdd) {
    if(isAdd){
        v[1].y = v[1].y + avgHeight;
        v[0].y = v[0].y + avgHeight;
    }else {
        v[1].y = v[1].y - avgHeight;
        v[0].y = v[0].y - avgHeight;
    }

    let yDiff = (v[1].y - v[0].y);
    let xDiff = (v[1].x - v[0].x);

    let gradient = yDiff / xDiff;

    let xThreshMin = 1;
    let xThreshMax = 2000;

    let yMin;
    let yMax;
    if(gradient === 0) {
        // extend the line
        yMin = v[0].y;
        yMax = v[0].y;
    }else{
        yMin = (v[0].y) - (gradient * (v[0].x - xThreshMin));
        yMax = (v[0].y) + (gradient * (xThreshMax - v[0].x));
    }
    if(isRoundValues) {
        yMin = Math.round(yMin);
        yMax = Math.round(yMax);
    }
    return {xMin : xThreshMin, xMax : xThreshMax, yMin: yMin, yMax: yMax};
}


function createRectCoordinates(line1, line2) {
    return [[line1.xMin, line1.yMin], [line1.xMax, line1.yMax], [line2.xMax, line2.yMax],[line2.xMin, line2.yMin]];
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

// (?<description>.+)(?<currency>£|€|\$)(?<amount>\d+\.\d{2})
// /(?:.+)(?:£|€|\$)(?:\d+\.\d{2})/
/(.+)(£|€|\$)(\d+\.\d{2})/.exec('format  $12.00');