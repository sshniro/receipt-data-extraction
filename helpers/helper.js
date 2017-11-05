function generateAlgorithmOutPutTable(receipt) {
    let htmlString = "<p>";
    htmlString = htmlString + "_________________________________";
    htmlString = htmlString + "<h3> For Dev Purpose</h3>";
    let stage1 = receipt.stage1;
    let stage2 = receipt.stage2;

    let tableStartTag = '<table>';
    let tableEndTag = '</table>';

    let trSTag = '<tr>';
    let trETag = '</tr>';

    let thSTag = '<th>';
    let thETag = '</th>';

    let tdSTag = '<td>';
    let tdETag = '</td>';

    htmlString = htmlString + tableStartTag +
        trSTag +
        thSTag + 'Line No.' + thETag +
        thSTag + 'Algo Stage 1' + thETag +
        thSTag + 'Algo Stage 2' + thETag +
        trETag;


    for(let i=0;i< stage1.length;i++) {
        let lineStatString = '';
        if(i< stage2.length){
            lineStatString = trSTag +
                tdSTag + i + tdETag +
                tdSTag + stage1[i].toString() + tdETag +
                tdSTag + stage2[i].toString() + tdETag +
                trETag;
        }else {
            lineStatString = trSTag +
                tdSTag + i + tdETag +
                tdSTag + stage1[i].toString() + tdETag +
                tdSTag + '-' + tdETag +
                trETag;
        }
        htmlString = htmlString + lineStatString;
    }
    htmlString = htmlString + tableEndTag;
    return htmlString;
}

var exports = module.exports = {};

exports.generateAlgorithmOutPutTable = function (receipt) {
    return generateAlgorithmOutPutTable(receipt);
};
