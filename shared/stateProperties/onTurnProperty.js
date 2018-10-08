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
    constructor(intent, entities) {
        this.intent = intent || '';
        this.entities = entities || [];
    }
    getEntityByName(entityName) {
        let i = this.entities.findIndex((entity) => entity.name === entityName);
        return this.entities[i];
    }
    /**
     *
     * Static method to create an on turn property object from LUIS results
     *
     * @param {Object} LUISResults
     * @returns {OnTurnProperty}
     */
    static fromLUISResults(LUISResults) {
        let LUIS_ENTITIES = ['Account']; // add more in central helper
        let onTurnProperties = new OnTurnProperty();
        onTurnProperties.intent = botbuilder_ai_1.LuisRecognizer.topIntent(LUISResults);
        // Gather entity values if available. Uses a const list of LUIS entity names.
        LUIS_ENTITIES.forEach(luisEntity => {
            if (luisEntity in LUISResults.entities) {
                onTurnProperties.entities.push(new entityProperty_1.EntityProperty(luisEntity, LUISResults.entities[luisEntity]));
            }
        });
        return onTurnProperties;
    }
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