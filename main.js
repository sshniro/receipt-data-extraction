var inside = require('point-in-polygon');
var polygon = [ [ 1.234, 200.44 ], [ 2000, 200], [ 2000, 300], [ 1, 300 ] ];

console.dir([
    inside([ 1998, 230 ], polygon)
]);