export class EntityProperty {
    /**
     * Entity Property constructor.
     *
     * @param {String} name entity name
     * @param {String} value entity value
     */
    constructor(public name, public value) {
        if (!name || !value) throw new Error('Need name and value to create an entity');
    }


}