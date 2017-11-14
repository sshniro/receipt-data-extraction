const deepcopy = require("deepcopy");

function generateEmptyReceipt(id) {
    let receipt = {
        id: id,
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
    let shopName = '';

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

function regexToGetDescriptionAndPrice(lines, isAzure) {
    let lineItemList = [];
    let priceRegex = /^\d+\.\d{2}/;
    let currencyPriceRegex = /(^)(£|€|\$)(\d+\.\d{2})/;

    if(isAzure) {
    }else{
        lines = removeUnwantedLineItems(lines);
        lines = removeLineWithOnlyPrice(lines, priceRegex);
        lines = removeLineWithOnlyPrice(lines, currencyPriceRegex);
    }

    for(let i=0; i < lines.length; i++) {
        let line = lines[i];
        let match = /(.+)(£|€|\$)(\d+\.\d{2})/.exec(line);
        if(isAzure) {
            match = /(.+)(.\d{2})/.exec(line);
        }
        if(match !== null) {
            if(isAzure) {
                lineItemList.push({desc: match[1], price: match[2]})
            }else{
                lineItemList.push({desc: match[1], price: match[3]})
            }
        }else{
            if(isAzure){
            }else{
                lineItemList.push({desc: line, price: '0'})
            }
        }
    }
    return lineItemList;
}

function removeLineWithOnlyPrice(lines, regex) {
    let lineIndex = [];
    for(let i=0; i < lines.length; i++) {
        let line = lines[i];
        let match = regex.exec(line);
        if(match !== null) {
            lineIndex.push(i)
        }
    }

    let modLines = [];
    if(lineIndex.length !== 0) {
        lineIndex.sort(function(a, b){return b-a});

        for(let j=0; j< lineIndex.length; j++) {
            lines.splice(lineIndex[j], 1);
        }
    }

    return lines;
}

function removeUnwantedLineItems(lines) {
    let receiptStartIdentifier = [];
    let receiptEndIdentifier = [];

    let tescoStartIdentifier = {name: 'tesco', identifier: ['tesco']};
    let tescoEndIdentifier = {name: 'tesco', identifier: ['sub-total','total to pay','multibuy savings', 'reduced price']};
    let saintStartIdentifier = {name: 'Sainsbury', identifier: ['Sainsbury', 'vat number']};
    let saintEndIdentifier = {name: 'Sainsbury', identifier: ['total', 'balance due']};

    receiptStartIdentifier.push(tescoStartIdentifier);
    receiptStartIdentifier.push(saintStartIdentifier);

    receiptEndIdentifier.push(tescoEndIdentifier);
    receiptEndIdentifier.push(saintEndIdentifier);

    let line;
    let lineStartIndex = [];
    let lineEndIndex = [];

    for(let i=0; i < receiptStartIdentifier.length; i++){
        for(let j=0; j< receiptStartIdentifier[i]['identifier'].length; j++){
            let identifier = receiptStartIdentifier[i]['identifier'][j];

            for(let k=0; k < lines.length; k++){
                line = lines[k];
                let rgxp = new RegExp(identifier, 'i');
                let result = line.match(rgxp);
                if(result){
                    lineStartIndex.push(k);
                }
            }
        }
    }


    for(let i=0; i < receiptEndIdentifier.length; i++){
        for(let j=0; j< receiptEndIdentifier[i]['identifier'].length; j++){
            let identifier = receiptEndIdentifier[i]['identifier'][j];

            for(let k=0; k < lines.length; k++){
                line = lines[k];
                let rgxp = new RegExp(identifier, 'i');
                let result = line.match(rgxp);
                if(result){
                    lineEndIndex.push(k);
                }
            }
        }
    }

    let startIndex = 0;
    let endIndex = lines.length;

    let startThresh = Math.round(lines.length * 0.2);
    // let endThresh = Math.round(lines.length * 0.2);

    if(lineStartIndex.length !== 0) {
        let newLineStartIndex = lineStartIndex.filter(function(x) {
            return x < startThresh;
        });

        if(newLineStartIndex.length !== 0) {
            startIndex = Math.max.apply(null, newLineStartIndex) + 1;
        }
    }

    if(lineStartIndex.length !== 0) {
        endIndex = Math.min.apply(null, lineEndIndex);
    }

    let modLines = deepcopy(lines);
    if(startIndex < endIndex) {
        modLines = lines.splice(startIndex, (endIndex-startIndex))
    }

    return modLines;
    // modLines = modLines.splice(0, startIndex);

    // console.log('hello world');

}

function getPossibleLineItems() {

}

function createReceiptFromManualData(lineItemsArray) {
    let receipt = {};
    let lineItems = [];
    for(let i=0; i< lineItemsArray.length; i++){
        lineItems.push({
            line: lineItemsArray[i]['TILLROLL_LINE_NUMBER'],
            desc:lineItemsArray[i]['TILLROLL_LINE_DESC'],
            price: lineItemsArray[i]['LINE_PRICE']
        })
    }
    receipt.lineItems = lineItems;
    receipt.shopName = lineItemsArray[0]['SHOP_NAME'];
    receipt.total = lineItemsArray[0]['TILLROLL_RECORDED_SPEND'];
    return receipt;
}


var exports = module.exports = {};

exports.getShopName = function (lines) {
    return getShopName(lines);
};
exports.generateEmptyReceipt = function (receiptId) {
    return generateEmptyReceipt(receiptId);
};
exports.regexToGetDescriptionAndPrice = function (lines, isAzure) {
    return regexToGetDescriptionAndPrice(lines, isAzure);
};
exports.createReceiptFromManualData = function (lineItemsArray) {
    return createReceiptFromManualData(lineItemsArray);
};



// (?<description>.+)(?<currency>£|€|\$)(?<amount>\d+\.\d{2})
// /(?:.+)(?:£|€|\$)(?:\d+\.\d{2})/
// /(.+)(£|€|\$)(\d+\.\d{2})/.exec('format  $12.00');