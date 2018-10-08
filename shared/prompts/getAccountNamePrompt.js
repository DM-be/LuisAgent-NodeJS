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
class GetAcountNamePrompt extends botbuilder_dialogs_1.TextPrompt {
    /**
     *
     */
    constructor(dialogId, botConfig, accountNameAccessor, onTurnAccessor) {
        super(dialogId, (prompt) => __awaiter(this, void 0, void 0, function* () {
            return true; // always return true for now -- add validation later
        }));
        this.dialogId = dialogId;
        this.botConfig = botConfig;
        this.accountNameAccessor = accountNameAccessor;
        this.onTurnAccessor = onTurnAccessor;
        if (!dialogId)
            throw new Error('Need dialog ID');
        if (!botConfig)
            throw new Error('Need bot configuration');
        if (!accountNameAccessor)
            throw new Error('Need account name property accessor');
        if (!onTurnAccessor)
            throw new Error('Need on turn property accessor');
    }
}
exports.GetAcountNamePrompt = GetAcountNamePrompt;
//# sourceMappingURL=getAccountNamePrompt.js.map