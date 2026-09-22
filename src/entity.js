export class Entity {
    constructor(id, state = {}) {
        this.id = id;

        this.state = {
            size: state.size ?? 1,
            stability: state.stability ?? 0.5
        };
    }

    cloneState() {
        return {
            ...this.state
        };
    }

    clone(newId) {
        return new Entity(newId, this.cloneState());
    }
}