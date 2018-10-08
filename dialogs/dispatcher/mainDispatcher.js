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
const whatCanYouDo_1 = require("./../whatCanYouDo/whatCanYouDo");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// dialog name
const MAIN_DISPATCHER_DIALOG = 'MainDispatcherDialog';
// const for state properties
const USER_PROFILE_PROPERTY = 'userProfile';
const MAIN_DISPATCHER_STATE_PROPERTY = 'mainDispatcherState';
// const for cancel and none intent names
const NONE_INTENT = 'None';
const CANCEL_INTENT = 'Cancel';
const ACCOUNT_PROMPT = 'accountPrompt';
// Query property from ../whatCanYouDo/resources/whatCanYHouDoCard.json
// When user responds to what can you do card, a query property is set in response.
const QUERY_PROPERTY = 'query';
class MainDispatcher extends botbuilder_dialogs_1.ComponentDialog {
    // private dialogs: DialogSet;
    /**
        * Constructor.
        *
        * @param {BotConfiguration} botConfig bot configuration
        * @param {StatePropertyAccessor} onTurnAccessor
        * @param {ConversationState} conversationState
        * @param {UserState} userState
        */
    constructor(botConfig, onTurnAccessor, conversationState, userState) {
        super(MAIN_DISPATCHER_DIALOG);
        this.botConfig = botConfig;
        this.onTurnAccessor = onTurnAccessor;
        this.conversationState = conversationState;
        this.userState = userState;
        if (!botConfig)
            throw new Error('Missing parameter. Bot Configuration is required.');
        if (!onTurnAccessor)
            throw new Error('Missing parameter. On turn property accessor is required.');
        if (!conversationState)
            throw new Error('Missing parameter. Conversation state is required.');
        if (!userState)
            throw new Error('Missing parameter. User state is required.');
        // Create state objects for user, conversation and dialog states.
        this.userProfileAccessor = conversationState.createProperty(USER_PROFILE_PROPERTY);
        this.mainDispatcherAccessor = conversationState.createProperty(MAIN_DISPATCHER_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.mainDispatcherAccessor);
        this.addDialog(new whatCanYouDo_1.WhatCanYouDoDialog());
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(ACCOUNT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog('giveAccount', [
            this.askForAccountLabel.bind(this),
            this.collectAndDisplayAccountLabel.bind(this)
        ]));
    }
    static getName() {
        return MAIN_DISPATCHER_DIALOG;
    }
    /// test
    collectAndDisplayAccountLabel(step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield step.context.sendActivity(`Got it. You want the balance of ${step.result}`);
            return yield step.endDialog(step.result);
        });
    }
    askForAccountLabel(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            // return dc.prompt()
            return yield dc.prompt(ACCOUNT_PROMPT, `Hmmm without an account that would be hard to check.... Please enter it now`);
        });
    }
    // end test
    /**
         * Override onBeginDialog
         *
         * @param {DialogContext} dc dialog context
         * @param {Object} options dialog turn options
         */
    onBeginDialog(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override default begin() logic with bot orchestration logic
            return yield this.mainDispatch(dc);
        });
    }
    /**
     * Override onContinueDialog
     *
     * @param {DialogContext} dc dialog context
     */
    onContinueDialog(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override default continue() logic with bot orchestration logic
            return yield this.mainDispatch(dc);
        });
    }
    /**
     * Main Dispatch
     *
     * This method examines the incoming turn property to determine
     * 1. If the requested operation is permissible - e.g. if user is in middle of a dialog,
     *     then an out of order reply should not be allowed.
     * 2. Calls any outstanding dialogs to continue
     * 3. If results is no-match from outstanding dialog .OR. if there are no outstanding dialogs,
     *    decide which child dialog should begin and start it
     *
     * @param {DialogContext} dialog context
     */
    mainDispatch(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // get on turn property through the property accessor
            const onTurnProperty = yield this.onTurnAccessor.get(dc.context);
            console.log(onTurnProperty);
            // Evaluate if the requested operation is possible/ allowed.
            // const reqOpStatus = await this.isRequestedOperationPossible(dc.activeDialog, onTurnProperty.intent);
            // if (!reqOpStatus.allowed) {
            //     await dc.context.sendActivity(reqOpStatus.reason);
            //     // Nothing to do here. End main dialog.
            //     return await dc.endDialog();
            // }
            // continue outstanding dialogs
            let dialogTurnResult = yield dc.continueDialog();
            // This will only be empty if there is no active dialog in the stack.
            // Removing check for dialogTurnStatus here will break successful cancellation of child dialogs.
            // E.g. who are you -> cancel -> yes flow.
            if (!dc.context.responded && dialogTurnResult !== undefined && dialogTurnResult.status !== botbuilder_dialogs_1.DialogTurnStatus.complete) {
                // No one has responded so start the right child dialog.
                dialogTurnResult = yield this.beginChildDialog(dc, onTurnProperty);
            }
            if (dialogTurnResult === undefined)
                return yield dc.endDialog();
            // Examine result from dc.continue() or from the call to beginChildDialog().
            switch (dialogTurnResult.status) {
                case botbuilder_dialogs_1.DialogTurnStatus.complete: {
                    // The active dialog finished successfully. Ask user if they need help with anything else.
                    //await dc.context.sendActivity(MessageFactory.suggestedActions(GenSuggestedQueries(), `Is there anything else I can help you with?`));
                    yield dc.context.sendActivity(`Is there anything else I can help you with?`);
                    break;
                }
                case botbuilder_dialogs_1.DialogTurnStatus.waiting: {
                    // The active dialog is waiting for a response from the user, so do nothing
                    break;
                }
                case botbuilder_dialogs_1.DialogTurnStatus.cancelled: {
                    // The active dialog's stack has been cancelled
                    yield dc.cancelAllDialogs();
                    break;
                }
            }
            return dialogTurnResult;
        });
    }
    /**
     * Method to begin appropriate child dialog based on user input
     *
     * @param {DialogContext} dc
     * @param {OnTurnProperty} onTurnProperty
     */
    beginChildDialog(dc, onTurnProperty) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (onTurnProperty.getIntent()) {
                case 'checkAccount':
                    let accountLabelEntity = onTurnProperty.getEntityByName('Account');
                    if (accountLabelEntity) {
                        let accountLabelName = accountLabelEntity.value;
                        console.log('made the api call here ');
                    }
                    if (accountLabelEntity === undefined) {
                        // prompt 
                        this.onTurnAccessor.set(dc.context, onTurnProperty);
                        return yield dc.beginDialog('giveAccount');
                        // make call
                    }
                //return await dc.endDialog();
                // return await this.beginWhatCanYouDoDialog(dc, onTurnProperty);
                // return
                case NONE_INTENT:
                default:
                    yield dc.context.sendActivity(`I'm still learning.. Sorry, I do not know how to help you with that.`);
                    return yield dc.context.sendActivity(`Follow [this link](https://www.bing.com/search?q=${dc.context.activity.text}) to search the web!`);
            }
        });
    }
    /**
     * Method to evaluate if the requested user operation is possible.
     * User could be in the middle of a multi-turn dialog where interruption might not be possible or allowed.
     *
     * @param {String} activeDialog
     * @param {String} requestedOperation
     * @returns {Object} outcome object
     */
    // async isRequestedOperationPossible(activeDialog, requestedOperation) {
    //     let outcome = { allowed: true, reason: '' };
    //     // E.g. What_can_you_do is not possible when you are in the middle of Who_are_you dialog
    //     if (requestedOperation === WhatCanYouDoDialog.Name) {
    //         if (activeDialog === WhoAreYouDialog.Name) {
    //             outcome.allowed = false;
    //             outcome.reason = `Sorry! I'm unable to process that. You can say 'cancel' to cancel this conversation..`;
    //         }
    //     } else if (requestedOperation === CANCEL_INTENT) {
    //         if (activeDialog === undefined) {
    //             outcome.allowed = false;
    //             outcome.reason = `Sure, but there is nothing to cancel..`;
    //         }
    //     }
    //     return outcome;
    // }
    /**
    * Helper method to begin what can you do dialog.
    *
    * @param {DialogContext} dc dialog context
    * @param {OnTurnProperty} onTurnProperty
    */
    beginWhatCanYouDoDialog(dc, onTurnProperty) {
        return __awaiter(this, void 0, void 0, function* () {
            // Handle case when user interacted with the what can you do card.
            // What can you do card sends a custom data property with intent name, text value and possible entities.
            // See ../whatCanYouDo/resources/whatCanYouDoCard.json for card definition.
            let queryProperty = (onTurnProperty.entities || []).filter(item => item.entityName === QUERY_PROPERTY);
            if (queryProperty.length !== 0) {
                let parsedJSON;
                try {
                    parsedJSON = JSON.parse(queryProperty[0].entityValue);
                }
                catch (err) {
                    return yield dc.context.sendActivity(`Choose a query from the card drop down before you click 'Let's talk!'`);
                }
                if (parsedJSON.text !== undefined) {
                    dc.context.activity.text = parsedJSON.text;
                    yield dc.context.sendActivity(`You said: '${dc.context.activity.text}'`);
                }
                // create a set a new on turn property
                // await this.onTurnAccessor.set(dc.context, OnTurnProperty.fromCardInput(parsedJSON));
                return yield this.beginChildDialog(dc, parsedJSON);
            }
            return yield dc.beginDialog(whatCanYouDo_1.WhatCanYouDoDialog.getName());
        });
    }
}
exports.MainDispatcher = MainDispatcher;
//# sourceMappingURL=mainDispatcher.js.map