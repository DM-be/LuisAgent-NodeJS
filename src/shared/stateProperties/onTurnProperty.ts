import {
    EntityProperty
} from './entityProperty';
import {
    LuisRecognizer
} from 'botbuilder-ai';
import { RecognizerResult } from 'botbuilder';

export class OnTurnProperty {
    /**
     * On Turn Property constructor.
     *
     * @param {String} intent intent name
     * @param {EntityProperty []} entities Array of Entities
     */

    private intent: string;
    private entities: EntityProperty[];

    public getIntent(): string {
        return this.intent;
    }

    public getEntityProperties() {
        return this.entities;
    }

    public addEntityProperty(entityProperty: EntityProperty): void{
        this.entities.push(entityProperty);
    }

    constructor(intent ? : string, entities ? : EntityProperty[]) {
        this.intent = intent || '';
        this.entities = entities || [];
    }

    public setIntent(intent: string): void{
        this.intent = intent;
    }


    public getEntityByName(entityName: string): EntityProperty {
        let i = this.entities.findIndex((entity: EntityProperty) => entity.name === entityName);
        return this.entities[i];
    }
    /**
     *
     * Static method to create an on turn property object from LUIS results
     *
     * @param {Object} LUISResults
     * @returns {OnTurnProperty}
     */

    public static getOnTurnPropertyFromLuisResults(LUISResults: RecognizerResult): OnTurnProperty {
        let LUIS_ENTITIES = ['Account']; // add more in central helper
        let onTurnProperty = new OnTurnProperty();
        onTurnProperty.setIntent(LuisRecognizer.topIntent(LUISResults))
        // Gather entity values if available. Uses a const list of LUIS entity names.
        LUIS_ENTITIES.forEach(luisEntity => {
            if (luisEntity in LUISResults.entities) {
                onTurnProperty.addEntityProperty(new EntityProperty(luisEntity, LUISResults.entities[luisEntity]));
            }
        });
        return onTurnProperty;
    }


    //TODO: refactor 
    /**
     *
     * Static method to create an on turn property object from card input
     *
     * @param {Object} cardValue context.activity.value from a card interaction
     * @returns {OnTurnProperty}
     */

    static fromCardInput(cardValue: Object): OnTurnProperty {
        // All cards used by this bot are adaptive cards with the card's 'data' property set to useful information.
        let onTurnProperties = new OnTurnProperty();
        for (var key in cardValue) {
            if (!cardValue.hasOwnProperty(key)) continue;
            if (key.toLowerCase().trim() === 'intent') {
                onTurnProperties.intent = cardValue[key];
            } else {
                onTurnProperties.entities.push(new EntityProperty(key, cardValue[key]));
            }
        }
        return onTurnProperties;
    }

}