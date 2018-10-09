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
const axios_1 = require("axios");
class GetAcountNamePrompt extends botbuilder_dialogs_1.TextPrompt {
    /**
     * custom prompt for getting an accountName and validating it against the known accounts of the user
     * @param {String []} accountNames variable holding accountNames for the validator, gets filled on constructing via a promise
     */
    constructor(dialogId, botConfig) {
        super(dialogId, (prompt) => __awaiter(this, void 0, void 0, function* () {
            this.accountNames = yield this.getAllAccounts();
            const value = prompt.recognized.value.toLowerCase();
            if (this.accountNames.findIndex(acc => acc === value) === -1) {
                yield prompt.context.sendActivity(`You dont have an account named ${value} please provide correct one`);
                return false;
            }
            return true;
        }));
        this.dialogId = dialogId;
        this.botConfig = botConfig;
        if (!dialogId)
            throw new Error('Need dialog ID');
        if (!botConfig)
            throw new Error('Need bot configuration');
    }
    /**
     * Method to get all account names associated with user
     *
     * @returns {Promise <string []>} Promise resolves in array of strings, if error an array with a single empty string
     */
    getAllAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = `https://nestjsbackend.herokuapp.com/accounts/`;
                const res = yield axios_1.default.get(url);
                return res.data;
            }
            catch (error) {
                console.log('error occured in getting all accounts');
                return [''];
            }
        });
    }
}
exports.GetAcountNamePrompt = GetAcountNamePrompt;
//# sourceMappingURL=getAccountNamePrompt.js.map