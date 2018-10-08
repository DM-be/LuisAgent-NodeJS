"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_1 = require("botbuilder");
// Require the adaptive card.
const helpCard = require('./resources/whatCanYouDoCard.json');
// This dialog's name. Also matches the name of the intent from ../dispatcher/resources/cafeDispatchModel.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const WHAT_CAN_YOU_DO_DIALOG = 'What_can_you_do';
/**
 *
 * What can you do dialog.
 *   Sends the what can you do adaptive card to user.
 *   Includes a suggested actions of queries users can try. See ../shared/helpers/genSuggestedQueries.js
 *
 */
class WhatCanYouDoDialog extends botbuilder_dialogs_1.Dialog {
    static getName() {
        return WHAT_CAN_YOU_DO_DIALOG;
    }
    constructor() {
        super(WHAT_CAN_YOU_DO_DIALOG);
    }
    /**
     * Override dialogBegin.
     *
     * @param {DialogContext} dialog context
     * @param {Object} options
     */
    beginDialog(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dc.context.sendActivity({
                attachments: [botbuilder_1.CardFactory.adaptiveCard(helpCard)]
            });
            yield dc.context.sendActivity(`Pick a query from the card or you can use the suggestions below.`);
            return yield dc.endDialog();
        });
    }
}
exports.WhatCanYouDoDialog = WhatCanYouDoDialog;
//# sourceMappingURL=whatCanYouDo.js.map