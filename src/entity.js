export class Entity {
    constructor(id, type = "A") {
        this.id = id;
        this.type = type;

        this.state = {
            energy: 10,
            activity: 0,
            memory: 0
        };
    }

    clone() {
        const entity = new Entity(this.id, this.type);

        entity.state = {
            ...this.state
        };

        return entity;
    }
}