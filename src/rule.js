export class Rule {
    constructor(name, condition, action) {
        this.name = name;
        this.condition = condition;
        this.action = action;
    }

    apply(entity, world) {
        if (!this.condition(entity, world)) {
            return null;
        }

        return this.action(entity, world);
    }
}