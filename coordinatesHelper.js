const inside = require('point-in-polygon');
const deepcopy = require("deepcopy");

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


function createRectCoordinates(line1, line2) {
    return [[line1.xMin, line1.yMin], [line1.xMax, line1.yMax], [line2.xMax, line2.yMax],[line2.xMin, line2.yMin]];
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



var exports = module.exports = {};

exports.invertAxis = function (data, yMax) {
    return invertAxis(data, yMax);
};

exports.getBigbb = function (mergedArray) {
    return getBigbb(mergedArray);
};

exports.combineBB = function (mergedArray) {
    return combineBB(mergedArray);
};
