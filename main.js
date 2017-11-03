var inside = require('point-in-polygon');
var polygon = [[ 1, 1430], [ 1000, 1413],[ 1000, 1367], [1, 1383]];

var levenshtein = require('fast-levenshtein');

var distance = levenshtein.get(' jack', '*  jack');
console.log(distance);
