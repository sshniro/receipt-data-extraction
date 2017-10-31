var inside = require('point-in-polygon');
var polygon = [ [ 1, 1430 ], [ 1000, 1413],
    [ 1000, 1367], [ 1, 1383 ] ];

// console.dir([
//     inside([ 1900, 290    ], polygon)
// ]);

for(i = 0;i< 100; i++){
    let v = 1383+i;
    console.log(v + ' : ' + inside([ 10, v], polygon))
}

function invertAxis(data) {
    for(let i=0; i < data.textAnnotations; i++ ){
        let v = data.textAnnotations[i].boundingPoly.vertices;
        let yMax;
        let yArray = [];
        if(i == 0){
            for(let j=0; i <4; i++){
                yArray.push(v[i]);
            }
            let results = Math.max.apply(null, yArray);
            console.log(results);
            continue;
        }else{

        }
    }
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
    r = [[line1.xMin, line1.yMin], [line1.xMax, line1.yMax], [line2.xMax, line2.yMax],[line2.xMin, line2.yMin]];
    return r;
}

var r = {
    A: {x: 50, y: 0},
    B: {x: 0, y: 20},
    C: {x: 10, y: 50},
    D: {x: 60, y: 30}
};

var m = {x: 40, y: 20};

function computation() {
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