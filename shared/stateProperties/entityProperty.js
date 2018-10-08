"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityProperty {
    /**
     * Entity Property constructor.
     *
     * @param {String} name entity name
     * @param {String} value entity value
     */
    constructor(name, value) {
        this.name = name;
        this.value = value;
        if (!name || !value)
            throw new Error('Need name and value to create an entity');
    }
}
exports.EntityProperty = EntityProperty;
//# sourceMappingURL=entityProperty.js.map