import { OnTurnProperty } from './../stateProperties/onTurnProperty';
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
import { EntityService } from '../helpers/entityService';


export class GetAcountNamePrompt extends TextPrompt {
    private accountNames: string[];
    /**
     * custom prompt for getting an accountName and validating it against the known accounts of the user
     * @param {String []} accountNames variable holding accountNames for the validator, gets filled on constructing via a promise
     */
    constructor(private dialogId: string, private botConfig: any, private onTurnAccessor: StatePropertyAccessor, private entityService: EntityService) {
        super(dialogId, async (prompt: PromptValidatorContext < string > ) => {
            const value = prompt.recognized.value.toLowerCase();
            if (!entityService.accountNamesContains(value)) {
                await prompt.context.sendActivity(`You dont have an account named ${value} please provide correct one`);
                return false;
            }
            return true;
        });

        if (!dialogId) throw new Error('Need dialog ID');
        if (!botConfig) throw new Error('Need bot configuration');
        if (!entityService) throw new Error('Need entity service');
        if (!onTurnAccessor) throw new Error('Need onturnaccessor');
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