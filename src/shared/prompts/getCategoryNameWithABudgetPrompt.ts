import { EntityService } from './../helpers/entityService';
import {
    StatePropertyAccessor
} from 'botbuilder';
import {
    TextPrompt,
    PromptValidatorContext
} from "botbuilder-dialogs";
import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';


export class GetCategoryNameWithABudgetPrompt extends TextPrompt {

    /**
     * custom prompt for getting a categoryName, with a budget, and validating it against known categories containing a tracked budget
     * @param {String []} categoryNamesWithABudget variable holding categoryNames for the validator, gets filled on constructing via a promise
     */

    
    constructor(private dialogId: string, private botConfig: any, private entityService: EntityService) {
        super(dialogId, async (prompt: PromptValidatorContext < string > ) => {
             
            const value = prompt.recognized.value.toLowerCase();
            if (entityService.getCategoryNamesWithABudget().findIndex(acc => acc === value) === -1) {
                await prompt.context.sendActivity(`You dont have a category named ${value} with a tracked budget, please provide correct one`);
                return false;
            }
            return true;
        });
        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
    }
 
}