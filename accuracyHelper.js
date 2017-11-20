const deepcopy = require("deepcopy");
const levenshtein = require('fast-levenshtein');
const _ = require('lodash');

function calculateAccuracyForShopName(receipt, manualReceipt) {
    if(receipt.shopName.toLowerCase().trim() === manualReceipt.shopName.toLowerCase()) {
        receipt.shopAccuracy = 100;
    }else {
        receipt.shopAccuracy = 0;
    }
    return receipt;
}

function calculateAccuracyTotalVal(receipt, manualReceipt) {
    if(receipt.totalVal === '-' || receipt.totalVal === undefined){
        receipt.totalVal = '-';
        receipt.totalValAccuracy = 0;
        return receipt;
    }

    let price = parseFloat(manualReceipt.total).toString();
    let distance = levenshtein.get(price, receipt.totalVal.toString());

    let priceLen = receipt.totalVal.length;
    let pricePercentage = Math.round(((priceLen - distance) / priceLen)*100);

    receipt.totalValAccuracy = pricePercentage;

    return receipt;
}

// TODO remove * from the description
function calculateAccuracyForLineItems(ocrLineItems, realLineItemsClone, receipt) {
    let lineItemStat = [];
    let realLineItems = deepcopy(realLineItemsClone);


    for(let i=0; i< ocrLineItems.length; i++){
        let descScoreList  = [];
        let priceScoreList  = [];

        for(let j=0; j<realLineItems.length; j++){
            let price = parseFloat(ocrLineItems[i].price).toString();
            descScoreList.push(levenshtein.get(ocrLineItems[i].desc.toLowerCase().trim(), realLineItems[j].desc.toLowerCase().trim()));
            priceScoreList.push(levenshtein.get(price, realLineItems[j].price.toString()));
        }

        let index = _.indexOf(descScoreList, _.min(descScoreList));
        let descScore = descScoreList[index];
        let priceScore = priceScoreList[index];

        let wordLen = ocrLineItems[i]['desc'].length;
        let priceLen = ocrLineItems[i]['price'].length;
        let descPercentage = Math.round(((wordLen - descScore) / wordLen)*100);
        let pricePercentage = Math.round(((priceLen - priceScore) / priceLen)*100);

        if(descPercentage > 40){
            if(pricePercentage < 0) {
                pricePercentage = 0;
            }
            let statLineItem = {
                real : deepcopy(realLineItems[index]),
                ocr : ocrLineItems[i] ,
                descAccuracy: descPercentage ,
                priceAccuracy : pricePercentage,
                accuracy : computeLineItemAccuracyWithWeights(descPercentage, pricePercentage)
            };
            lineItemStat.push(statLineItem);
            realLineItems.splice(index, 1);
        }
    }

    // If there are unidentified
    for(let j=0; j<realLineItems.length; j++){
        let statLineItem = {
            real : deepcopy(realLineItems[j]),
            ocr : {desc: '-', price: '-'} ,
            descAccuracy: 0,
            priceAccuracy  : 0,
            accuracy : 0
        };
        lineItemStat.push(statLineItem);
    }

    receipt.lineItemStat = lineItemStat;
    receipt.lineItemAccuracy = computeTotalLineItemAccuracy(receipt);
    return receipt;
}

function computeLineItemAccuracyWithWeights(descPercentage, pricePercentage) {
    let descW = 0.70;
    let priceW = 0.30;

    return Math.round((descPercentage * descW) + (pricePercentage * priceW))
}

function computeTotalLineItemAccuracy(receipt) {
    let lineItemStat = receipt.lineItemStat;
    let totalAccuracy = 0;

    for(let i=0;i< lineItemStat.length; i++){
        totalAccuracy = totalAccuracy + lineItemStat[i].accuracy;
    }

    return Math.round(totalAccuracy / lineItemStat.length);
}

function computeReceiptAccuracy(receipt) {
    let lineItemWeight = 0.90;
    let shopNameWeight = 0.05;
    let totalValWeight = 0.05;

    let accuracy = 0;

    accuracy = Math.round(receipt.lineItemAccuracy * lineItemWeight);
    accuracy = accuracy + Math.round(receipt.shopAccuracy * shopNameWeight);
    Math.round(receipt.totalValAccuracy * totalValWeight);
    receipt.accuracy = accuracy;
}

var exports = module.exports = {};

exports.calculateAccuracyForLineItems = function (ocrLineItems, realLineItemsClone, receipt) {
    return calculateAccuracyForLineItems(ocrLineItems, realLineItemsClone, receipt);
};

exports.calculateAccuracyForShopName = function (receipt, manualReceipt) {
    return calculateAccuracyForShopName(receipt, manualReceipt);
};

exports.calculateAccuracyTotalVal = function (receipt, manualReceipt) {
    return calculateAccuracyTotalVal(receipt, manualReceipt);
};

exports.computeReceiptAccuracy = function (receipt) {
    return computeReceiptAccuracy(receipt);
};
