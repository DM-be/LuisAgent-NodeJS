"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class GetUserNamePrompt extends botbuilder_dialogs_1.TextPrompt {
    /**
     * Constructor.
     * This is a custom TextPrompt that uses a LUIS model to handle turn.n conversations including interruptions.
     * @param {String} dialogId Dialog ID
     * @param {Object} botConfig Bot configuration
     * @param {Object} userProfileAccessor accessor for user profile property
     * @param {Object} conversationState conversations state
     */
    constructor(dialogId, botConfig, userProfileAccessor, conversationState, onTurnAccessor) {
        // Call super and provide a prompt validator
        super(dialogId);
        this.dialogId = dialogId;
        this.botConfig = botConfig;
        this.userProfileAccessor = userProfileAccessor;
        this.conversationState = conversationState;
        this.onTurnAccessor = onTurnAccessor;
        if (!dialogId)
            throw new Error('Missing parameter. Dialog ID is required.');
        if (!botConfig)
            throw new Error('Missing parameter. Bot configuration is required.');
        if (!userProfileAccessor)
            throw new Error('Missing parameter. User profile property accessor is required.');
        if (!conversationState)
            throw new Error('Missing parameter. Conversation state is required.');
    }
}
exports.GetUserNamePrompt = GetUserNamePrompt;
//# sourceMappingURL=getUserNamePrompt.js.map