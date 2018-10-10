import {
    EntityService
} from './../helpers/entityService';
import {
    StatePropertyAccessor
} from 'botbuilder';
import {
    TextPrompt,
    PromptValidatorContext,
    DialogContext
} from "botbuilder-dialogs";
import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';
import {
    OnTurnProperty
} from '../stateProperties/onTurnProperty';


export class GetCategoryNameWithABudgetPrompt extends TextPrompt {

    /**
     * custom prompt for getting a categoryName, with a budget, and validating it against known categories containing a tracked budget
     * overrides the continueDialog to check for cancel,... intents
     * @param {String []} categoryNamesWithABudget variable holding categoryNames for the validator, gets filled on constructing via a promise
     */

    constructor(private dialogId: string, private botConfig: any, private entityService: EntityService, private onTurnAccessor: StatePropertyAccessor) {
        super(dialogId, async (prompt: PromptValidatorContext < string > ) => {
            const value = prompt.recognized.value.toLowerCase();
            if (!entityService.categoryNamesWithABudgetContains(value)) {
                await prompt.context.sendActivity(`You dont have a category named ${value} with a tracked budget, please provide correct one`);
                return false;
            }
            return true;
        });
        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
        if (!onTurnAccessor) throw new Error('Need onturnaccessor!');
    }
    /**
     * Override continueDialog.
     *   The override enables
     *     recognizing the cancel intent to cancel the dialog
     *     todo: recognizing other intents and resolving them appropiatly
     *     ...
     * @param {DialogContext} dc context
     */
    async continueDialog(dc: DialogContext) {
        let turnContext = dc.context;
        // let step = dc.activeDialog.state;
        const onTurnProperty: OnTurnProperty = await this.onTurnAccessor.get(turnContext);
        switch (onTurnProperty.getIntent()) {
            case 'Cancel':
                await dc.context.sendActivity('ok ill cancel this conversation for you :)');
                return await dc.cancelAllDialogs();
            case 'None':
                return await super.continueDialog(dc);
            default:
                return await super.continueDialog(dc);
        }
    }
}