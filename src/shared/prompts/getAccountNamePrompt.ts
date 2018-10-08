import { StatePropertyAccessor } from 'botbuilder';
import {  TextPrompt } from "botbuilder-dialogs";

export class GetAcountNamePrompt extends TextPrompt {
    /**
     *
     */
    constructor(private dialogId: string,private botConfig: any, private accountNameAccessor: StatePropertyAccessor, private onTurnAccessor: StatePropertyAccessor) {
        super(dialogId, async prompt => {
            return true; // always return true for now -- add validation later
        });

        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
        if (!accountNameAccessor) throw new Error('Need account name property accessor');
        if (!onTurnAccessor) throw new Error('Need on turn property accessor');


    }
}