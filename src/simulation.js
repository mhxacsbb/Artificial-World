export class Simulation {
    constructor(world, rules = []) {
        this.world = world;
        this.rules = rules;
    }

    step() {
        this.world.tick++;
        this.world.clearEvents();

        // ----------------------------------------------------
        // 1. 保存 Tick 开始时的世界状态
        // ----------------------------------------------------

        const snapshot = this.world.entities.map(entity => ({
            id: entity.id,
            type: entity.type,
            state: {
                ...entity.state
            }
        }));

        // ----------------------------------------------------
        // 2. 在快照上计算所有规则
        //    此阶段不允许直接修改真实世界
        // ----------------------------------------------------

        const changes = [];

        for (const entitySnapshot of snapshot) {

            for (const rule of this.rules) {

                if (!rule.condition(entitySnapshot, snapshot)) {
                    continue;
                }

                const change = rule.action(
                    {
                        id: entitySnapshot.id,
                        type: entitySnapshot.type,
                        state: {
                            ...entitySnapshot.state
                        }
                    },
                    snapshot
                );

                if (change) {
                    changes.push(change);
                }
            }
        }

        // ----------------------------------------------------
        // 3. 统一提交所有状态变化
        // ----------------------------------------------------

        for (const change of changes) {

            const entity = this.world.getEntity(change.entityId);

            if (!entity) {
                continue;
            }

            if (change.state) {
                entity.state = {
                    ...entity.state,
                    ...change.state
                };
            }

            if (change.event) {
                this.world.addEvent(change.event);
            }
        }

        return this.world.events;
    }

    reset() {
        this.world.reset();
        this.world.initialize();
    }
}