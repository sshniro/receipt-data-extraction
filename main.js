var inside = require('point-in-polygon');
var polygon = [ [ 1, 246 ], [ 2000, 336],
    [ 2000, 380], [ 1, 294 ] ];

console.dir([
    inside([ 1900, 290    ], polygon)
]);

for(i = 0;i< 100; i++){
    let v = 246+i;
    console.log(v + ' : ' + inside([ 1900, v], polygon))
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