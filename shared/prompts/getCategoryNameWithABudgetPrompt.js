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
class GetCategoryNameWithABudgetPrompt extends botbuilder_dialogs_1.TextPrompt {
    /**
     * custom prompt for getting a categoryName, with a budget, and validating it against known categories containing a tracked budget
     * @param {String []} categoryNamesWithABudget variable holding categoryNames for the validator, gets filled on constructing via a promise
     */
    constructor(dialogId, botConfig, entityService, onTurnAccessor) {
        super(dialogId, (prompt) => __awaiter(this, void 0, void 0, function* () {
            const value = prompt.recognized.value.toLowerCase();
            if (entityService.getCategoryNamesWithABudget().findIndex(acc => acc === value) === -1) {
                yield prompt.context.sendActivity(`You dont have a category named ${value} with a tracked budget, please provide correct one`);
                return false;
            }
            return true;
        }));
        this.dialogId = dialogId;
        this.botConfig = botConfig;
        this.entityService = entityService;
        this.onTurnAccessor = onTurnAccessor;
        if (!dialogId)
            throw new Error('Need dialog ID');
        if (!botConfig)
            throw new Error('Need bot configuration');
    }
    /**
        * Override dialogContinue.
        *   The override enables
        *     Interruption to be kicked off from right within this dialog.
        *     Ability to leverage a dedicated LUIS model to provide flexible entity filling,
        *     corrections and contextual help.
        *
        * @param {DialogContext} dialog context
        */
    continueDialog(dc) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let turnContext = dc.context;
            let step = dc.activeDialog.state;
            const onTurnProperty = yield this.onTurnAccessor.get(turnContext);
            switch (onTurnProperty.getIntent()) {
                case 'Cancel':
                    yield dc.context.sendActivity('ok ill cancel this conversation for you :)');
                    return yield dc.cancelAllDialogs();
                default:
                    return yield _super("continueDialog").call(this, dc);
            }
        });
    }
}
exports.GetCategoryNameWithABudgetPrompt = GetCategoryNameWithABudgetPrompt;
//# sourceMappingURL=getCategoryNameWithABudgetPrompt.js.map