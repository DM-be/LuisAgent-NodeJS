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
    private categoryNamesWithABudget: string[];
    /**
     * custom prompt for getting a categoryName, with a budget, and validating it against known categories containing a tracked budget
     * @param {String []} categoryNamesWithABudget variable holding categoryNames for the validator, gets filled on constructing via a promise
     */
    constructor(private dialogId: string, private botConfig: any) {
        super(dialogId, async (prompt: PromptValidatorContext < string > ) => {
            this.categoryNamesWithABudget = await this.getCategoryNamesWithABudget();
            const value = prompt.recognized.value.toLowerCase();
            if (this.categoryNamesWithABudget.findIndex(acc => acc === value) === -1) {
                await prompt.context.sendActivity(`You dont have a category named ${value} with a tracked budget, please provide correct one`);
                return false;
            }
            return true;
        });

        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
    }
    /**
     * Method to get all category names with a budget
     * 
     * @returns {Promise <string []>} Promise resolves in array of strings, if error an array with a single empty string
     */
    public async getCategoryNamesWithABudget(): Promise < string[] > {
        try {
            let url = `https://nestjsbackend.herokuapp.com/budget/`;
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            console.log('error occured in getting all accounts');
            return [''];
        }
    }
}