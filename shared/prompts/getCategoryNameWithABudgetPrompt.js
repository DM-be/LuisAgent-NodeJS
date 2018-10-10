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
     * overrides the continueDialog to check for cancel,... intents
     * @param {String []} categoryNamesWithABudget variable holding categoryNames for the validator, gets filled on constructing via a promise
     */
    constructor(dialogId, botConfig, onTurnAccessor, entityService) {
        super(dialogId, (prompt) => __awaiter(this, void 0, void 0, function* () {
            const value = prompt.recognized.value.toLowerCase();
            if (!entityService.categoryNamesWithABudgetContains(value)) {
                yield prompt.context.sendActivity(`You dont have a category named ${value} with a tracked budget, please provide correct one`);
                return false;
            }
            return true;
        }));
        this.dialogId = dialogId;
        this.botConfig = botConfig;
        this.onTurnAccessor = onTurnAccessor;
        this.entityService = entityService;
        if (!dialogId)
            throw new Error('Need dialog ID');
        if (!botConfig)
            throw new Error('Need bot configuration');
        if (!onTurnAccessor)
            throw new Error('Need onturnaccessor!');
    }
    /**
     * Override continueDialog.
     *   The override enables
     *     recognizing the cancel intent to cancel the dialog
     *     todo: recognizing other intents and resolving them appropiatly
     *     ...
     * @param {DialogContext} dc context
     */
    continueDialog(dc) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let turnContext = dc.context;
            // let step = dc.activeDialog.state;
            const onTurnProperty = yield this.onTurnAccessor.get(turnContext);
            switch (onTurnProperty.getIntent()) {
                case 'Cancel':
                    yield dc.context.sendActivity('ok ill cancel this conversation for you :)');
                    return yield dc.cancelAllDialogs();
                case 'None':
                    return yield _super("continueDialog").call(this, dc);
                default:
                    return yield _super("continueDialog").call(this, dc);
            }
        });
    }
}
exports.GetCategoryNameWithABudgetPrompt = GetCategoryNameWithABudgetPrompt;
//# sourceMappingURL=getCategoryNameWithABudgetPrompt.js.map