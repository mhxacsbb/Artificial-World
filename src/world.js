import { Entity } from "./entity.js";

export class World {
    constructor() {
        this.tick = 0;
        this.entities = [];
        this.events = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    getEntity(id) {
        return this.entities.find(entity => entity.id === id);
    }

    addEvent(event) {
        this.events.push(event);
    }

    clearEvents() {
        this.events = [];
    }

    reset() {
        this.tick = 0;
        this.entities = [];
        this.events = [];
    }

    initialize() {
        this.reset();

        this.addEntity(new Entity(1, "A"));
        this.addEntity(new Entity(2, "A"));
        this.addEntity(new Entity(3, "B"));
    }
}