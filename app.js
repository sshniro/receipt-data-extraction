/**
 * Created by nirojans on 9/1/17.
 */
var fs = require("fs");
var deepcopy = require("deepcopy");
var content = fs.readFileSync("saint.json");
var textJson = JSON.parse(content);
// generateHistogram(textJson);
mergeWords(textJson);

function getLines(mergedArray, data) {


}

function mergeWords(data) {
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
    pointInRectangle({x: 40, y: 20}, rect);
    // gradient * (mergedArray[0].boundingPoly.vertices[0].x) =

    console.log(mergedArray);

}

function getRectangle(v) {
    let yDiff = (-v[1].y - (-v[0].y));
    let xDiff = (v[1].x - v[0].x);

    let gradient = yDiff / xDiff;

    let xThreshMin = 1;
    let xThreshMax = 2000;

    if(gradient === 0) {
        // extend the line
    }else{
        yMin = (v[0].y) + (gradient * (v[0].x - xThreshMin));
        yMax = -(gradient * (xThreshMax - v[0].x)) + (v[0].y);
    }
    return {xMin : xThreshMin, xMax : xThreshMax, yMin: yMin, yMax: yMax};

    // let yDiff = (-mergedArray[0].boundingPoly.vertices[1].y - (-mergedArray[0].boundingPoly.vertices[0].y));
    // let xDiff = (mergedArray[0].boundingPoly.vertices[1].x - mergedArray[0].boundingPoly.vertices[0].x);
    //
    // let gradient = yDiff / xDiff;
    //
    // let xThreshMin = 1;
    // let xThreshMax = 2000;
    //
    // if(gradient === 0) {
    //     // extend the line
    // }else{
    //     yMin = (mergedArray[0].boundingPoly.vertices[0].y) + (gradient * (mergedArray[0].boundingPoly.vertices[0].x - xThreshMin));
    //     yMax = (gradient * (xThreshMax - mergedArray[0].boundingPoly.vertices[0].x)) + (mergedArray[0].boundingPoly.vertices[0].y);
    // }
}

function identifyShop() {
    var string = "Stackoverflow is the BEST";
    var result = string.match(/best/i);
    // result == 'BEST';

    if (result){
        alert('Matched');
    }
}

function pointInRectangle(m, r) {
    var AB = vector(r.A, r.B);
    var AM = vector(r.A, m);
    var BC = vector(r.B, r.C);
    var BM = vector(r.B, m);
    var dotABAM = dot(AB, AM);
    var dotABAB = dot(AB, AB);
    var dotBCBM = dot(BC, BM);
    var dotBCBC = dot(BC, BC);
    return 0 <= dotABAM && dotABAM <= dotABAB && 0 <= dotBCBM && dotBCBM <= dotBCBC;
}

function vector(p1, p2) {
    return {
        x: (p2.x - p1.x),
        y: (p2.y - p1.y)
    };
}

function dot(u, v) {
    return u.x * v.x + u.y * v.y;
}

function createRectCoordinates(line1, line2) {
    var r = {
        A: {x: line1.xMin, y: line1.yMin},
        B: {x: line1.xMax, y: line1.yMax},
        C: {x: line2.xMin, y: line2.yMin},
        D: {x: line2.xMax, y: line2.yMax}
    };
    return r;
}

var r = {
    A: {x: 50, y: 0},
    B: {x: 0, y: 20},
    C: {x: 10, y: 50},
    D: {x: 60, y: 30}
};

var m = {x: 40, y: 20};

debugger;

function generateHistogram(text) {
    var histogram = [];

    for(var data in text.textAnnotations) {
        console.log(data)
    }
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


