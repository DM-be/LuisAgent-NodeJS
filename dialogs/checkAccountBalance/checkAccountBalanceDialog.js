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
const getAccountNamePrompt_1 = require("./../../shared/prompts/getAccountNamePrompt");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const axios_1 = require("axios");
// This dialog's name. Also matches the name of the intent from ../dispatcher/resources/checkAccountBalance.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const CHECK_ACCOUNT_BALANCE = 'check_account_balance';
const CHECK_ACCOUNT_BALANCE_WATERFALL = 'checkAccountBalanceWaterfall';
const GET_LOCATION_DIALOG_STATE = 'getLocDialogState';
const CONFIRM_DIALOG_STATE = 'confirmDialogState';
// Turn.N here refers to all back and forth conversations beyond the initial trigger until the book table dialog is completed or cancelled.
const GET_ACCOUNT_NAME_PROMPT = 'getAccountName';
class CheckAccountBalanceDialog extends botbuilder_dialogs_1.ComponentDialog {
    /**
     * Constructor
     * // todo adjust params etc
     * @param {Object} botConfig bot configuration
     * @param {Object} accessor for on turn
     * @param {Object} accessor for the dialog
     * @param {Object} conversation state object
     */
    constructor(botConfig, accountNameAccessor, onTurnAccessor) {
        super(CHECK_ACCOUNT_BALANCE);
        this.botConfig = botConfig;
        this.accountNameAccessor = accountNameAccessor;
        this.onTurnAccessor = onTurnAccessor;
        // add dialogs
        // Water fall book table dialog
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CHECK_ACCOUNT_BALANCE_WATERFALL, [
            this.askForAccountName.bind(this),
            this.checkAccountBalance.bind(this)
        ]));
        this.addDialog(new getAccountNamePrompt_1.GetAcountNamePrompt(GET_ACCOUNT_NAME_PROMPT, botConfig, accountNameAccessor, onTurnAccessor));
    }
    static getName() {
        return CHECK_ACCOUNT_BALANCE;
    }
    askForAccountName(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const onTurnProperty = yield this.onTurnAccessor.get(step.context);
            let accountName = onTurnProperty.getEntityByName('Account');
            if (accountName !== undefined) {
                yield this.accountNameAccessor.set(step.context, accountName.value);
                return yield step.next(accountName.value);
            }
            else
                return yield step.prompt(GET_ACCOUNT_NAME_PROMPT, `What's the name of the account you want to check?`);
        });
    }
    /**
     * Waterfall step to finalize user's response and return the balance of the account
     *
     * @param {WaterfallStepContext} WaterfallStepContext
     */
    checkAccountBalance(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                const accountName = step.result;
                console.log(accountName);
                let url = `https://nestjsbackend.herokuapp.com/accounts/${accountName}`;
                const res = yield axios_1.default.get(url);
                const amountLeft = res.data;
                yield step.context.sendActivity(`The balance on ${accountName} is ${amountLeft}`);
            }
            return yield step.endDialog();
        });
    }
}
exports.CheckAccountBalanceDialog = CheckAccountBalanceDialog;
//# sourceMappingURL=checkAccountBalanceDialog.js.map