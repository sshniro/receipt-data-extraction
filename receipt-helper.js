function generateEmptyReceipt() {
    let receipt = {
        id:'',
        shopName: '',
        shopAccuracy: '-',
        lineItemStat: [],
        lineItemAccuracy: '-',
        totalVal: '-',
        totalValAccuracy: '-',
        receiptAccuracy: '-',
        isVerified : false
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


var exports = module.exports = {};

exports.getShopName = function (lines) {
    return getShopName(lines);
};
exports.generateEmptyReceipt = function () {
    return generateEmptyReceipt();
};
exports.regexToGetDescriptionAndPrice = function (lines) {
    return regexToGetDescriptionAndPrice(lines);
};



// (?<description>.+)(?<currency>£|€|\$)(?<amount>\d+\.\d{2})
// /(?:.+)(?:£|€|\$)(?:\d+\.\d{2})/
// /(.+)(£|€|\$)(\d+\.\d{2})/.exec('format  $12.00');