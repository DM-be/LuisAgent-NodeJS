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
const getCategoryNameWithABudgetPrompt_1 = require("../../shared/prompts/getCategoryNameWithABudgetPrompt");
// This dialog's name. Also matches the name of the intent from ../dispatcher/resources/checkAccountBalance.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const CHECK_BUDGET = 'check_budget';
const CHECK_BUDGET_WATERFALL = 'checkAccountBalanceWaterfall';
const GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT = 'getCategoryNameWithABudget';
class CheckBudgetDialog extends botbuilder_dialogs_1.ComponentDialog {
    /**
     * Constructor
     * // todo adjust params etc
     * @param {Object} botConfig bot configuration
     * @param {StatePropertyAccessor} onTurnAccessor turn property accessor
     */
    constructor(botConfig, onTurnAccessor, entityService) {
        super(CHECK_BUDGET);
        this.botConfig = botConfig;
        this.onTurnAccessor = onTurnAccessor;
        this.entityService = entityService;
        // add dialogs
        // Water fall book table dialog
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CHECK_BUDGET_WATERFALL, [
            this.askForCategoryNameWithABudget.bind(this),
            this.checkBudget.bind(this)
        ]));
        this.addDialog(new getCategoryNameWithABudgetPrompt_1.GetCategoryNameWithABudgetPrompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT, botConfig, onTurnAccessor, entityService));
    }
    static getName() {
        return CHECK_BUDGET;
    }
    askForCategoryNameWithABudget(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const onTurnProperty = yield this.onTurnAccessor.get(step.context);
            let categoryEntityProperty = onTurnProperty.getEntityByName('Category');
            if (categoryEntityProperty === undefined) {
                return yield step.prompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT, `Van welke category wil je het budget zien?`);
            }
            else {
                let categoryName = categoryEntityProperty.getValue()[0];
                if (this.entityService.categoryNamesWithABudgetContains(categoryName)) {
                    return yield step.next(categoryName);
                }
                else
                    return yield step.prompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT, `Die category heeft geen budget. Geef opnieuw in`);
            }
        });
    }
    /**
     * Waterfall step to finalize user's response and return the balance of the account
     *
     * @param {WaterfallStepContext} WaterfallStepContext
     */
    checkBudget(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                console.log(step.result);
                const categoryName = step.result;
                try {
                    let url = `https://nestjsbackend.herokuapp.com/budget/${categoryName}`;
                    const res = yield axios_1.default.get(url);
                    const { limitAmount, currentAmountSpent } = res.data;
                    const remaining = limitAmount - currentAmountSpent;
                    yield step.context.sendActivity(`Your remaining budget in ${categoryName} is ${remaining}`);
                }
                catch (error) {
                    yield step.context.sendActivity(`something went wrong...`);
                }
            }
            return yield step.endDialog();
        });
    }
}
exports.CheckBudgetDialog = CheckBudgetDialog;
//# sourceMappingURL=checkBudgetDialog.js.map