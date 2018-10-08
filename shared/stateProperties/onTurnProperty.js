"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityProperty_1 = require("./entityProperty");
const botbuilder_ai_1 = require("botbuilder-ai");
class OnTurnProperty {
    getIntent() {
        return this.intent;
    }
    getEntityProperties() {
        return this.entities;
    }
    addEntityProperty(entityProperty) {
        this.entities.push(entityProperty);
    }
    constructor(intent, entities) {
        this.intent = intent || '';
        this.entities = entities || [];
    }
    setIntent(intent) {
        this.intent = intent;
    }
    /**
   *
   * Method to get entity by name, returns EntityProperty or undefined if does not exist
   *
   * @param {string} entityName
   * @returns {EntityProperty} entityProperty or undefined
   */
    getEntityByName(entityName) {
        let i = this.entities.findIndex((entity) => entity.name === entityName);
        if (i !== -1) {
            return this.entities[i];
        }
        return undefined;
    }
    /**
     *
     * Static method to create an on turn property object from LUIS results
     *
     * @param {Object} LUISResults
     * @returns {OnTurnProperty}
     */
    static getOnTurnPropertyFromLuisResults(LUISResults) {
        let LUIS_ENTITIES = ['Account']; // add more in central helper
        let onTurnProperty = new OnTurnProperty();
        onTurnProperty.setIntent(botbuilder_ai_1.LuisRecognizer.topIntent(LUISResults));
        // Gather entity values if available. Uses a const list of LUIS entity names.
        LUIS_ENTITIES.forEach(luisEntity => {
            if (luisEntity in LUISResults.entities) {
                onTurnProperty.addEntityProperty(new entityProperty_1.EntityProperty(luisEntity, LUISResults.entities[luisEntity]));
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
    static fromCardInput(cardValue) {
        // All cards used by this bot are adaptive cards with the card's 'data' property set to useful information.
        let onTurnProperties = new OnTurnProperty();
        for (var key in cardValue) {
            if (!cardValue.hasOwnProperty(key))
                continue;
            if (key.toLowerCase().trim() === 'intent') {
                onTurnProperties.intent = cardValue[key];
            }
            else {
                onTurnProperties.entities.push(new entityProperty_1.EntityProperty(key, cardValue[key]));
            }
        }
        return onTurnProperties;
    }
}
exports.OnTurnProperty = OnTurnProperty;
//# sourceMappingURL=onTurnProperty.js.map