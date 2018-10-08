import { OnTurnProperty } from './shared/stateProperties/onTurnProperty';
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// bot.js is your main bot dialog entry point for handling activity types

// Import required Bot Builder
import {
    ActivityTypes,
    CardFactory,
    ConversationState,
    UserState,
    StatePropertyAccessor,
    TurnContext,
    RecognizerResult,
    MessageFactory
} from 'botbuilder';
import {
    LuisRecognizer,
    IntentData
} from 'botbuilder-ai';

import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';

import {
    DialogSet,
    TextPrompt,
    WaterfallDialog,
    DialogState,
    Dialog,
    DialogContext,
    DialogTurnResult,
    WaterfallStep,
    WaterfallStepContext
} from 'botbuilder-dialogs'
import { MainDispatcher } from './dialogs/dispatcher/mainDispatcher';




// LUIS service type entry as defined in the .bot file.
const LUIS_CONFIGURATION: string = 'BasicBotLuisApplication';

// Supported LUIS Intents.
const GREETING_INTENT: string = 'Greeting';
const CANCEL_INTENT: string = 'Cancel';
const HELP_INTENT: string = 'Help';
const NONE_INTENT: string = 'None';
const CHECKACCOUNT_INTENT: string = "checkAccount";

// persistent state properties
const DIALOG_STATE_PROPERTY: string = 'dialogState';
const USER_NAME_PROP: string = 'user_name';
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';
const ON_TURN_PROPERTY = 'onTurnStateProperty';

// dialog references
const WHO_ARE_YOU: string = 'who_are_you';
const HELLO_USER: string = 'hello_user';
const NAME_PROMPT: string = 'name_prompt';


/**
 * Demonstrates the following concepts:
 *  Displaying a Welcome Card, using Adaptive Card technology
 *  Use LUIS to model Greetings, Help, and Cancel interactions
 */
export class BasicBot {
    /**
     * @param {BotConfiguration} botConfig contents of the .bot file
     * @param {Object} conversationState state store for the conversation (ACCESSOR)
     * @param {Object} userState private state store per user (ACCESSOR)
     */

    private dialogState: StatePropertyAccessor;
    private onTurnAccessor: StatePropertyAccessor;
    private userName: StatePropertyAccessor;
    private countProperty: StatePropertyAccessor;
    private dialogSet: DialogSet;
    private luisRecognizer: LuisRecognizer;
    private counter: number = 1;


    constructor(private botConfig: any, private conversationState: ConversationState, private userState: UserState) {
        // creates a new state accessor property. see https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userName = this.userState.createProperty(USER_NAME_PROP);
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.onTurnAccessor = conversationState.createProperty(ON_TURN_PROPERTY);

        this.dialogSet = new DialogSet(this.dialogState);
        this.dialogSet.add(new TextPrompt(NAME_PROMPT));
        //this.dialogSet.add(new TextPrompt('accountNamePrompt')) // TODO: refactor in own pages - per dialog subject (intent)
        // this.dialogSet.add(this.askForAccountName.bind(this));
        // Create a dialog that asks the user for their name.
        this.dialogSet.add(new WaterfallDialog(WHO_ARE_YOU, [
            this.askForName.bind(this),
            this.collectAndDisplayName.bind(this)
        ]));
        this.dialogSet.add(new WaterfallDialog(HELLO_USER, [
            this.displayName.bind(this)
        ]));

        this.dialogSet.add(new MainDispatcher(botConfig, this.onTurnAccessor, conversationState, userState));

        if (!botConfig) throw ('Missing parameter.  botConfig is required');
        // Add the LUIS recognizer.
        const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId) throw ('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        this.luisRecognizer = new LuisRecognizer({
            applicationId: "4576b202-e5a9-4e2b-9b19-961ac2a0e831",
            endpoint: "https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/4576b202-e5a9-4e2b-9b19-961ac2a0e831?subscription-key=cbcdfd8ed0d14d48ae3b01dd8c739bbf&timezoneOffset=60&q=",
            endpointKey: "cbcdfd8ed0d14d48ae3b01dd8c739bbf"
        });


    }



    async askForName(dc: DialogContext, step) {
        // return dc.prompt()
        return await dc.prompt(NAME_PROMPT, `Hello and welcome, what is your name?`);

    }

    async askForAccountName(dc: DialogContext, userName: string): Promise < DialogTurnResult > {
        // return dc.prompt()
        return await dc.prompt('accountNamePrompt', `what account would you like to check ${userName} ?`);
    }

    // The second step in this waterfall collects the response, stores it in
    // the state accessor, then displays it.
    async collectAndDisplayName(step: WaterfallStepContext): Promise < DialogTurnResult > {
        await this.userName.set(step.context, step.result);
        await step.context.sendActivity(`Got it. You are ${ step.result }. How may I help you?`);
        return await step.endDialog();
    }
    // This step loads the user's name from state and displays it.
    async displayName(step: WaterfallStepContext): Promise < DialogTurnResult > {
        const userName = await this.userName.get(step.context);
        await step.context.sendActivity(`Your name is ${ userName }.`);
        return await step.endDialog();
    }



    /**
     * Driver code that does one of the following:
     * 1. Use LUIS to recognize intents for incoming user message
     *
     * @param {Context} context turn context from the adapter
     */
    async onTurn(turnContext: TurnContext) {
        // Handle Message activity type, which is the main activity type for shown within a conversational interface
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types        
        this.counter++;
        if (turnContext.activity.type === ActivityTypes.Message) {

            // Create dialog context
            const dc: DialogContext = await this.dialogSet.createContext(turnContext);



            // Continue the current dialog
            // If the bot hasn't yet responded, try to continue any active dialog

                // Process on turn input (card or NLP) and gather new properties
            // OnTurnProperty object has processed information from the input message activity.
            let onTurnProperties = await this.detectIntentAndEntities(turnContext);
            //console.log(onTurnProperties);
            if (onTurnProperties === undefined) return;

            // Set the state with gathered properties (intent/ entities) through the onTurnAccessor
            await this.onTurnAccessor.set(turnContext, onTurnProperties);

            if (!turnContext.responded) {
                await dc.continueDialog();
            }


            let username = await this.userName.get(dc.context)
            // prevent calling luis on just a username
            // todo: find more elegant solution
            if (username !== turnContext.activity.text) {
                const results: RecognizerResult = await this.luisRecognizer.recognize(turnContext);
                const topIntent: string = LuisRecognizer.topIntent(results);
                switch (topIntent) {
                    case CHECKACCOUNT_INTENT:
                        await dc.beginDialog(MainDispatcher.getName());
                }
            }
        }
        // Handle ConversationUpdate activity type, which is used to indicates new members add to 
        // the conversation. 
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Do we have any new members added to the conversation?
            if (turnContext.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in turnContext.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message
                    // the 'bot' is the recipient for events from the channel,
                    // context.activity.membersAdded == context.activity.recipient.Id indicates the
                    // bot was added to the conversation.
                    if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                        // Welcome user.
                        // When activity type is "conversationUpdate" and the member joining the conversation is the bot
                        // we will send our Welcome Adaptive Card.  This will only be sent once, when the Bot joins conversation
                        // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
                        // const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                        //  await context.sendActivity({
                        //      attachments: [welcomeCard]
                        //  });
                        let dc: DialogContext = await this.dialogSet.createContext(turnContext);
                        await dc.beginDialog(WHO_ARE_YOU);


                    }
                }
            }
        }

        // only at the end of the turn
        await this.userState.saveChanges(turnContext);
        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
    /**
     * Async helper method to get on turn properties from cards or NLU using https://LUIS.ai
     *
     * - All cards for this bot -
     *   1. Are adaptive cards. See https://adaptivecards.io to learn more.
     *   2. All cards include an 'intent' field under 'data' section and can include entities recognized.
     * - Bot also uses a dispatch LUIS model that includes trigger intents for all dialogs.
     *   See ./dialogs/dispatcher/resources/cafeDispatchModel.lu for a description of the dispatch model.
     *
     * @param {TurnContext} turn context object
     *
     */
    async detectIntentAndEntities(turnContext: TurnContext) {
        // Handle card input (if any), update state and return.
        if (turnContext.activity.value !== undefined) {
            return OnTurnProperty.fromCardInput(turnContext.activity.value);
        }

        // Acknowledge attachments from user.
        if (turnContext.activity.attachments && turnContext.activity.attachments.length !== 0) {
            await turnContext.sendActivity(`Thanks for sending me that attachment. I'm still learning to process attachments.`);
            return undefined;
        }

        // Nothing to do for this turn if there is no text specified.
        if (turnContext.activity.text === undefined || turnContext.activity.text.trim() === '') {
            return;
        }

        // Call to LUIS recognizer to get intent + entities
        const LUISResults = await this.luisRecognizer.recognize(turnContext);

        // Return new instance of on turn property from LUIS results.
        // Leverages static fromLUISResults method
        return OnTurnProperty.getOnTurnPropertyFromLuisResults(LUISResults);
    }
    /**
     * Async helper method to welcome all users that have joined the conversation.
     *
     * @param {TurnContext} context conversation context object
     *
     */
    async welcomeUser(turnContext: TurnContext): Promise<void> {
        // Do we have any new members added to the conversation?
        if (turnContext.activity.membersAdded.length !== 0) {
            // Iterate over all new members added to the conversation
            for (var idx in turnContext.activity.membersAdded) {
                // Greet anyone that was not the target (recipient) of this message
                // the 'bot' is the recipient for events from the channel,
                // turnContext.activity.membersAdded == turnContext.activity.recipient.Id indicates the
                // bot was added to the conversation.
                if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                    // Welcome user.
                    await turnContext.sendActivity(`Hello, I am the Contoso Cafe Bot!`);
                    await turnContext.sendActivity(`I can help book a table and more..`);

                    // Send welcome card.
                    //await turnContext.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(WelcomeCard)));
                }
            }
        }
    
}



// dialogs.add('BalanceDialog', [
//     async function(dc){
//         let balance = Math.floor(Math.random() * Math.floor(100));
//         await dc.context.sendActivity(`Your balance is £${balance}.`);
//         await dc.continue();
//     },
//     async function(dc){
//         await dc.context.sendActivity(`OK, we're done here. What is next?`);
//         await dc.continue();
//     },
//     async function(dc){
//         await dc.end();
//     }
// ]);

// dialogs.add('TransferDialog', [
//     async function(dc) {
//         const state = convoState.get(dc.context);
//         if (state.AccountLabel) {
//             await dc.continue();
//         } else {
//             await dc.prompt('textPrompt', `Which account do you want to transfer from? For example Joint, Current, Savings etc`);
//         }
//     },
//     async function(dc, accountLabel) {
//         const state = convoState.get(dc.context);
//         // Save accountLabel
//         if (!state.AccountLabel) {
//             state.AccountLabel = accountLabel;
//         }

//         //continue
//         await dc.continue();
//     },
//     async function(dc) {
//         const state = convoState.get(dc.context);
//         await dc.context.sendActivity(`AccountLabel: ${state.AccountLabel}`);

//         //continue
//         await dc.continue();
//     },    
//     async function(dc){
//         await dc.context.sendActivity(`OK, we're done here. What is next?`);
//         await dc.continue();
//     },
//     async function(dc){
//         await dc.end();
//     }
// ]);
}


         // let account = entities[0];
                        // let accountLabel = results.entities["Account"];
                        // if (accountLabel === undefined) {
                        //     // ask with dialogprompt
                        //     // let accountLabel = await dc.prompt('accountNamePrompt', `what account would you like to check ?`);
                        //     // let url = `https://nestjsbackend.herokuapp.com/accounts/${accountLabel}`;
                        //     // const res = await axios.get(url);
                        //     // const amountLeft = res.data;
                        //     // await context.sendActivity(`The balance of ${accountLabel} is ${amountLeft}`);
                        // }
                        // if (accountLabel !== undefined) {
                        //     let url = `https://nestjsbackend.herokuapp.com/accounts/${accountLabel}`;
                        //     const res = await axios.get(url);
                        //     const amountLeft = res.data;
                        //     await context.sendActivity(`The balance of ${accountLabel} is ${amountLeft}`);
                        // }