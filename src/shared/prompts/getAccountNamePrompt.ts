import { StatePropertyAccessor } from 'botbuilder';
import {  TextPrompt } from "botbuilder-dialogs";


const ACCOUNT_NAMES = ['accountb', 'accounta'];

export class GetAcountNamePrompt extends TextPrompt {
    /**
     *
     */
    constructor(private dialogId: string,private botConfig: any, private accountNameAccessor: StatePropertyAccessor, private onTurnAccessor: StatePropertyAccessor) {
        super(dialogId, async prompt => {
            const value = prompt.recognized.value;
            if(ACCOUNT_NAMES.findIndex(acc => acc === value) === -1)
            {
                await prompt.context.sendActivity(`You dont have an account named ${value} please provide correct one`);
                return false;
            }
            return true;
        });

        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
        if (!accountNameAccessor) throw new Error('Need account name property accessor');
        if (!onTurnAccessor) throw new Error('Need on turn property accessor');


    }
}