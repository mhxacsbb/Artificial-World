import { Entity } from "./entity.js";
import { Operation } from "./operation.js";


/*
 * ============================================================
 * Copy
 * ============================================================
 *
 * Copy:
 *
 *     1 → n
 *
 * 源个体不会被消耗。
 * 复制体拥有新的 ID，但状态完全复制。
 */

export class CopyOperation extends Operation {
    constructor() {
        super("copy");
    }

    execute(world, input, parameters = {}) {
        if (input.length !== 1) {
            throw new Error(
                "Copy requires exactly one input entity."
            );
        }

        const source = input[0];

        const count = Math.floor(
            parameters.count ?? 1
        );

        if (count < 1) {
            throw new Error(
                "Copy count must be at least 1."
            );
        }

        const output = [];

        for (let i = 0; i < count; i++) {
            const entity = new Entity(
                world.nextEntityId(),
                source.cloneState()
            );

            output.push(entity);
        }

        return {
            type: "copy",

            /*
             * Copy 不消耗原个体。
             */
            consume: [],

            /*
             * 新产生的个体。
             */
            output
        };
    }
}


/*
 * ============================================================
 * Create
 * ============================================================
 *
 * Create:
 *
 *     n → 1
 *
 * n >= 2
 *
 * 输入个体全部被消耗，
 * 然后产生一个全新的个体。
 *
 *
 *     A + B + C
 *          │
 *          ▼
 *       Create
 *          │
 *          ▼
 *          D
 *
 * 结果：
 *
 *     A 删除
 *     B 删除
 *     C 删除
 *     D 新增
 *
 *
 * 创造权重完全由 Size 决定：
 *
 *     w_i = size_i / Σsize
 *
 * 稳定性决定噪声贡献：
 *
 *     instability_i = 1 - stability_i
 */

export class CreateOperation extends Operation {
    constructor() {
        super("create");
    }

    execute(world, input, parameters = {}) {
        if (input.length < 2) {
            throw new Error(
                "Create requires at least two input entities."
            );
        }


        /*
         * --------------------------------------------------------
         * 1. 计算总大小
         * --------------------------------------------------------
         */

        const totalSize = input.reduce(
            (sum, entity) => {
                return sum + entity.state.size;
            },
            0
        );

        if (totalSize <= 0) {
            throw new Error(
                "Total input size must be greater than zero."
            );
        }


        /*
         * --------------------------------------------------------
         * 2. 根据 Size 计算权重
         *
         *     w_i = size_i / Σsize
         *
         * 用户不输入权重。
         */

        const weights = input.map(
            entity => {
                return entity.state.size / totalSize;
            }
        );


        /*
         * --------------------------------------------------------
         * 3. 计算基础状态
         *
         * 当前第一版状态：
         *
         *     size
         *     stability
         *
         * 暂时都按照 Size 权重进行组合。
         */

        let newSize = 0;
        let newStability = 0;

        for (let i = 0; i < input.length; i++) {
            const entity = input[i];
            const weight = weights[i];

            newSize +=
                entity.state.size * weight;

            newStability +=
                entity.state.stability * weight;
        }


        /*
         * --------------------------------------------------------
         * 4. 计算创造过程中的扰动
         *
         * 稳定性越低，扰动越大。
         *
         *     instability = 1 - stability
         *
         * 每个个体的扰动贡献：
         *
         *     weight
         *     ×
         *     instability
         *     ×
         *     randomNoise
         */

        let noise = 0;

        for (let i = 0; i < input.length; i++) {
            const entity = input[i];
            const weight = weights[i];

            const instability =
                1 - entity.state.stability;

            const randomNoise =
                world.randomRange(-1, 1);

            noise +=
                weight *
                instability *
                randomNoise;
        }


        /*
         * --------------------------------------------------------
         * 5. 暂时让噪声影响 Stability
         *
         * 这里只是第一版实现。
         * 后续可以重新定义噪声如何作用于状态。
         */

        newStability +=
            noise * 0.1;

        newStability =
            Math.max(
                0,
                Math.min(
                    1,
                    newStability
                )
            );


        /*
         * --------------------------------------------------------
         * 6. 创建新的个体
         * --------------------------------------------------------
         */

        const entity = new Entity(
            world.nextEntityId(),
            {
                size: newSize,
                stability: newStability
            }
        );


        /*
         * --------------------------------------------------------
         * 7. 返回完整的世界变化
         *
         * 注意：
         *
         * consume 明确告诉 Simulation：
         * 哪些个体必须从世界中移除。
         *
         * Create 自己定义“消耗输入”。
         */

        return {
            type: "create",

            consume: input.map(
                entity => entity.id
            ),

            output: [
                entity
            ],

            weights,

            noise,

            result: {
                size: newSize,
                stability: newStability
            }
        };
    }
}