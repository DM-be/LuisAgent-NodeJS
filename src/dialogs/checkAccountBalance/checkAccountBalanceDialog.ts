import { EntityService } from './../../shared/helpers/entityService';
import {
    OnTurnProperty
} from './../../shared/stateProperties/onTurnProperty';
import {
    WaterfallStep,
    WaterfallStepContext,
    DialogTurnResult
} from 'botbuilder-dialogs';
import {
    GetAcountNamePrompt
} from './../../shared/prompts/getAccountNamePrompt';
import {
    ComponentDialog,
    WaterfallDialog
} from 'botbuilder-dialogs';

import {
    StatePropertyAccessor,
    ConversationState,
    UserState
} from 'botbuilder';
import {
    Dialog
} from 'botbuilder-dialogs';
import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';



// This dialog's name. Also matches the name of the intent from ../dispatcher/resources/checkAccountBalance.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const CHECK_ACCOUNT_BALANCE = 'check_account_balance';
const CHECK_ACCOUNT_BALANCE_WATERFALL = 'checkAccountBalanceWaterfall';
const GET_LOCATION_DIALOG_STATE = 'getLocDialogState';
const CONFIRM_DIALOG_STATE = 'confirmDialogState';

// Turn.N here refers to all back and forth conversations beyond the initial trigger until the book table dialog is completed or cancelled.
const GET_ACCOUNT_NAME_PROMPT = 'getAccountName';

export class CheckAccountBalanceDialog extends ComponentDialog {

    static getName(): string {
        return CHECK_ACCOUNT_BALANCE;
    }
    /**
     * Constructor
     * // todo adjust params etc
     * @param {Object} botConfig bot configuration
     * @param {Object} accessor for on turn
     * @param {Object} accessor for the dialog
     * @param {Object} conversation state object
     */
    constructor(private botConfig: any, private onTurnAccessor: StatePropertyAccessor, private entityService: EntityService) {
        super(CHECK_ACCOUNT_BALANCE);

        // add dialogs
        // Water fall book table dialog
        this.addDialog(new WaterfallDialog(CHECK_ACCOUNT_BALANCE_WATERFALL, [
            this.askForAccountName.bind(this),
            this.checkAccountBalance.bind(this)
        ]));

        this.addDialog(new GetAcountNamePrompt(GET_ACCOUNT_NAME_PROMPT,
            botConfig,
            onTurnAccessor,
            entityService
        ));
    }

    public async askForAccountName(step: WaterfallStepContext): Promise<DialogTurnResult<any>> {
        const onTurnProperty: OnTurnProperty = await this.onTurnAccessor.get(step.context);
        let accountNameEntityProperty = onTurnProperty.getEntityByName('Account');
        if (accountNameEntityProperty === undefined) {
            return await step.prompt(GET_ACCOUNT_NAME_PROMPT, `Van welke account wil je je balans zien?`);
        }
        else {
            let accountName = accountNameEntityProperty.getValue()[0];
            if(this.entityService.accountNamesContains(accountName)) {
                return await step.next(accountName);
            }
         else return await step.prompt(GET_ACCOUNT_NAME_PROMPT, `What's the name of the account you want to check?`);
        }
            
    }
    /**
     * Waterfall step to finalize user's response and return the balance of the account
     *
     * @param {WaterfallStepContext} WaterfallStepContext
     */
    async checkAccountBalance(step: WaterfallStepContext): Promise<DialogTurnResult<any>> {
        if (step.result) {
            const accountName = step.result;
            try {
                let url = `https://nestjsbackend.herokuapp.com/accounts/${accountName}`;
                const res = await axios.get(url);
                const amountLeft = res.data;
                await step.context.sendActivity(`The balance on ${accountName} is ${amountLeft}`);
            } catch (error) {
                console.log(error);
                await step.context.sendActivity(`something went wrong...`);
            }
        }
        return await step.endDialog();
    }


}