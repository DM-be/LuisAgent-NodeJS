import {
    EntityService
} from './../../shared/helpers/entityService';
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
import {
    GetCategoryNameWithABudgetPrompt
} from '../../shared/prompts/getCategoryNameWithABudgetPrompt';



// This dialog's name. Also matches the name of the intent from ../dispatcher/resources/checkAccountBalance.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const CHECK_BUDGET = 'check_budget';
const CHECK_BUDGET_WATERFALL = 'checkAccountBalanceWaterfall';

const GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT = 'getCategoryNameWithABudget';

export class CheckBudgetDialog extends ComponentDialog {

    static getName(): string {
        return CHECK_BUDGET;
    }
    /**
     * Constructor
     * // todo adjust params etc
     * @param {Object} botConfig bot configuration
     * @param {StatePropertyAccessor} onTurnAccessor turn property accessor
     */
    constructor(private botConfig: any, private onTurnAccessor: StatePropertyAccessor, private entityService: EntityService) {
        super(CHECK_BUDGET);

        // add dialogs
        // Water fall book table dialog
        this.addDialog(new WaterfallDialog(CHECK_BUDGET_WATERFALL, [
            this.askForCategoryNameWithABudget.bind(this),
            this.checkBudget.bind(this)
        ]));

        this.addDialog(new GetCategoryNameWithABudgetPrompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT,
            botConfig,
            entityService
        ));
    }

    public async askForCategoryNameWithABudget(step: WaterfallStepContext): Promise < DialogTurnResult < any >> {
        const onTurnProperty: OnTurnProperty = await this.onTurnAccessor.get(step.context);
        let categoryEntityProperty = onTurnProperty.getEntityByName('Category');
        if (categoryEntityProperty === undefined) {
            return await step.prompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT, `Van welke category wil je het budget zien?`);
        } else {
            let categoryName = categoryEntityProperty.getValue()[0];
            if (this.entityService.categoryNamesWithABudgetContains(categoryName)) {
                return await step.next(categoryName);
            } else return await step.prompt(GET_CATEGORY_NAME_WITH_A_BUDGET_PROMPT, `Die category heeft geen budget. Geef opnieuw in`);
        }

    }
    /**
     * Waterfall step to finalize user's response and return the balance of the account
     *
     * @param {WaterfallStepContext} WaterfallStepContext
     */
    async checkBudget(step: WaterfallStepContext): Promise < DialogTurnResult < any >> {
        if (step.result) {
            console.log(step.result);
            const categoryName = step.result;
            try {
                let url = `https://nestjsbackend.herokuapp.com/budget/${categoryName}`;
                const res = await axios.get(url);
                const budget: {
                    limitAmount: number,
                    currentAmountSpent: number
                } = res.data;
                const remaining = budget.limitAmount - budget.currentAmountSpent;
                await step.context.sendActivity(`Your remaining budget in ${categoryName} is ${remaining}`);
            } catch (error) {
                console.log(error);
                await step.context.sendActivity(`something went wrong...`);
            }
        }
        return await step.endDialog();
    }


}