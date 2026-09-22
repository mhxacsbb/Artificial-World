export class Simulation {
    constructor(world, operations = {}) {
        this.world = world;
        this.operations = operations;
    }


    /*
     * ============================================================
     * 执行操作
     * ============================================================
     */

    execute(
        operationName,
        entityIds,
        parameters = {}
    ) {
        const operation =
            this.operations[operationName];

        if (!operation) {
            throw new Error(
                `Unknown operation: ${operationName}`
            );
        }


        /*
         * 获取输入实体。
         */

        const input =
            entityIds.map(id => {
                const entity =
                    this.world.getEntity(id);

                if (!entity) {
                    throw new Error(
                        `Entity ${id} does not exist.`
                    );
                }

                return entity;
            });


        /*
         * Operation 自己决定：
         *
         *     消耗什么
         *     产生什么
         *     修改什么
         */

        const result =
            operation.execute(
                this.world,
                input,
                parameters
            );


        /*
         * 将操作结果应用到世界。
         */

        this.commit(result);


        /*
         * 记录历史。
         */

        this.world.recordHistory(
            operationName,
            {
                input: entityIds,

                parameters,

                result:
                    this.serializeResult(result)
            }
        );


        return result;
    }


    /*
     * ============================================================
     * 提交世界变化
     * ============================================================
     *
     * Simulation 不再理解 Copy / Create / Process
     * 的具体规则。
     *
     * 它只处理统一的三种变化：
     *
     *     consume
     *     output
     *     update
     */

    commit(result) {

        /*
         * --------------------------------------------------------
         * 1. 消耗实体
         * --------------------------------------------------------
         *
         * 由 Operation 明确指定。
         */

        if (result.consume) {
            for (
                const entityId
                of result.consume
            ) {
                this.world.removeEntity(
                    entityId
                );
            }
        }


        /*
         * --------------------------------------------------------
         * 2. 添加新实体
         * --------------------------------------------------------
         */

        if (result.output) {
            for (
                const entity
                of result.output
            ) {
                this.world.addEntity(
                    entity
                );
            }
        }


        /*
         * --------------------------------------------------------
         * 3. 更新已有实体
         * --------------------------------------------------------
         */

        if (result.update) {
            for (
                const change
                of result.update
            ) {
                const entity =
                    this.world.getEntity(
                        change.id
                    );

                if (!entity) {
                    continue;
                }

                entity.state = {
                    ...entity.state,
                    ...change.state
                };
            }
        }
    }


    /*
     * ============================================================
     * 历史记录序列化
     * ============================================================
     */

    serializeResult(result) {
        return {
            type: result.type,

            consume:
                result.consume ?? [],

            output:
                result.output?.map(
                    entity => ({
                        id: entity.id,
                        state: {
                            ...entity.state
                        }
                    })
                ) ?? [],

            update:
                result.update ?? [],

            weights:
                result.weights,

            noise:
                result.noise,

            result:
                result.result
        };
    }
}