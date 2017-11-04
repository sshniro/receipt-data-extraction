const deepcopy = require("deepcopy");
const levenshtein = require('fast-levenshtein');
const _ = require('lodash');

function calculateAccuracyForLineItems(ocrLineItems, realLineItemsClone, receipt) {
    let lineItemStat = [];
    let realLineItems = deepcopy(realLineItemsClone);


    for(let i=0; i< ocrLineItems.length; i++){
        let descScoreList  = [];
        let priceScoreList  = [];

        for(let j=0; j<realLineItems.length; j++){
            descScoreList.push(levenshtein.get(ocrLineItems[i].desc, realLineItems[j].desc));
            priceScoreList.push(levenshtein.get(ocrLineItems[i].price, realLineItems[j].price));
        }

        let index = _.indexOf(descScoreList, _.min(descScoreList));
        let descScore = descScoreList[index];

        let wordLen = ocrLineItems[i]['desc'].length;
        let descPercentage = Math.round(((wordLen - descScore) / wordLen)*100);
        let pricePercentage = Math.round(((wordLen - descScore) / wordLen)*100);

        if(descPercentage > 40){
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
            ocr : ocrLineItems[i] ,
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
    let descW = 0.90;
    let priceW = 0.10;

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

var exports = module.exports = {};

exports.calculateAccuracyForLineItems = function (ocrLineItems, realLineItemsClone, receipt) {
    return calculateAccuracyForLineItems(ocrLineItems, realLineItemsClone, receipt);
};
