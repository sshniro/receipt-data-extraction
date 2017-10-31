/**
 * Created by nirojans on 9/1/17.
 */


var fs = require("fs");
var content = fs.readFileSync("tesco.json");
var textJson = JSON.parse(content);
generateHistogram(textJson);

function generateHistogram(text) {
    var histogram = [];

    for(var data in text.textAnnotations) {
        conole.log(data)
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

var r = {
    A: {x: 50, y: 0},
    B: {x: 0, y: 20},
    C: {x: 10, y: 50},
    D: {x: 60, y: 30}
};

var m = {x: 40, y: 20};