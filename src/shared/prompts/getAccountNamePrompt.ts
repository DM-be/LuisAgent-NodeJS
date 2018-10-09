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


export class GetAcountNamePrompt extends TextPrompt {
    private accountNames: string[];
    /**
     * custom prompt for getting an accountName and validating it against the known accounts of the user
     * @param {String []} accountNames variable holding accountNames for the validator, gets filled on constructing via a promise
     */
    constructor(private dialogId: string, private botConfig: any) {
        super(dialogId, async (prompt: PromptValidatorContext < string > ) => {
            this.accountNames = await this.getAllAccounts();
            const value = prompt.recognized.value.toLowerCase();
            if (this.accountNames.findIndex(acc => acc === value) === -1) {
                await prompt.context.sendActivity(`You dont have an account named ${value} please provide correct one`);
                return false;
            }
            return true;
        });

        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
    }
    /**
     * Method to get all account names associated with user
     * 
     * @returns {Promise <string []>} Promise resolves in array of strings, if error an array with a single empty string
     */
    public async getAllAccounts(): Promise < string[] > {
        try {
            let url = `https://nestjsbackend.herokuapp.com/accounts/`;
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            console.log('error occured in getting all accounts');
            return [''];
        }
    }
}