import { Entity } from "./entity.js";

export class World {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.randomState = seed;

        this.entities = [];
        this.nextId = 1;

        this.history = [];
    }

    random() {
        // Mulberry32
        let t = this.randomState += 0x6D2B79F5;

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        const result =
            ((t ^ (t >>> 14)) >>> 0) / 4294967296;

        return result;
    }

    randomRange(min, max) {
        return min + this.random() * (max - min);
    }

    nextEntityId() {
        return this.nextId++;
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    createRandomBaseEntity() {
        const entity = new Entity(
            this.nextEntityId(),
            {
                size: this.randomRange(1, 10),
                stability: this.randomRange(0.1, 0.95)
            }
        );

        this.addEntity(entity);

        return entity;
    }

    initialize(baseCount = 4) {
        this.entities = [];
        this.nextId = 1;
        this.history = [];

        for (let i = 0; i < baseCount; i++) {
            this.createRandomBaseEntity();
        }

        this.recordHistory("initialize");
    }

    getEntity(id) {
        return this.entities.find(
            entity => entity.id === id
        );
    }

    removeEntity(id) {
        this.entities = this.entities.filter(
            entity => entity.id !== id
        );
    }

    recordHistory(operation, data = {}) {
        this.history.push({
            operation,
            entities: this.entities.map(entity => ({
                id: entity.id,
                state: {
                    ...entity.state
                }
            })),
            data
        });
    }

    reset(seed = Date.now()) {
        this.seed = seed;
        this.randomState = seed;
        this.entities = [];
        this.nextId = 1;
        this.history = [];
    }
}