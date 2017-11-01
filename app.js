/**
 * Created by nirojans on 9/1/17.
 */
var fs = require("fs");
var deepcopy = require("deepcopy");
var inside = require('point-in-polygon');
var content = fs.readFileSync("saint.json");
var textJson = JSON.parse(content);

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

    let arr = [];
    arr.push(mergedArray[0].boundingPoly.vertices[0]);
    arr.push(mergedArray[0].boundingPoly.vertices[1]);
    let line1 = getRectangle(arr);

    arr = [];
    arr.push(mergedArray[0].boundingPoly.vertices[3]);
    arr.push(mergedArray[0].boundingPoly.vertices[2]);
    let line2 = getRectangle(arr);

    let rect = createRectCoordinates(line1, line2);
    // let results = inside([1998, 230], rect);
    getBigbb(mergedArray);

    let lineItemList = regexToGetDescriptionAndPrice(getLines(mergedArray));
    console.log('test')
}

function getBigbb(mergedArray) {

    for(let i=0; i< mergedArray.length; i++) {
        let arr = [];
        arr.push(mergedArray[i].boundingPoly.vertices[0]);
        arr.push(mergedArray[i].boundingPoly.vertices[1]);
        let line1 = getRectangle(arr);

        arr = [];
        arr.push(mergedArray[i].boundingPoly.vertices[3]);
        arr.push(mergedArray[i].boundingPoly.vertices[2]);
        let line2 = getRectangle(arr);

        mergedArray[i]['bigbb'] = createRectCoordinates(line1, line2);
    }

}

function getRectangle(v, isRoundValues) {
    let yDiff = (-v[1].y - (-v[0].y));
    let xDiff = (v[1].x - v[0].x);

    let gradient = yDiff / xDiff;

    let xThreshMin = 1;
    let xThreshMax = 1000;

    let yMin;
    let yMax;
    if(gradient === 0) {
        // extend the line
        yMin = v[0].y;
        yMax = v[0].y;
    }else{
        yMin = (v[0].y) - (gradient * (v[0].x - xThreshMin));
        yMax = (v[0].y) - (gradient * (xThreshMax - v[0].x));
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


