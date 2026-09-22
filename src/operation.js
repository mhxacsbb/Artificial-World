export class Operation {
    constructor(name) {
        this.name = name;
    }

    execute(world, input, parameters = {}) {
        throw new Error(
            `Operation "${this.name}" is not implemented.`
        );
    }
}