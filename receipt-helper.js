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


var exports = module.exports = {};

exports.getShopName = function (lines) {
    return getShopName(lines);
};
exports.generateEmptyReceipt = function () {
    return generateEmptyReceipt();
};