import { Operation } from "./operation.js";


/*
 * ============================================================
 * Process
 * ============================================================
 *
 * Process:
 *
 *     1 → 1
 *
 * 用户选择：
 *
 *     1. 加工哪个状态量
 *     2. 状态量如何变化
 *
 * 加工不会产生新实体，
 * 不会删除实体，
 * Entity ID 保持不变。
 *
 *
 * 当前第一版支持的加工方式：
 *
 *     multiply
 *     add
 *
 * 例如：
 *
 *     Size × 0.5
 *
 * 或：
 *
 *     Stability + 0.1
 */

export class ProcessOperation extends Operation {
    constructor() {
        super("process");
    }


    execute(world, input, parameters = {}) {

        /*
         * Process 只能作用于一个个体。
         */

        if (input.length !== 1) {
            throw new Error(
                "Process requires exactly one input entity."
            );
        }


        const source = input[0];


        /*
         * --------------------------------------------------------
         * 1. 获取用户选择的状态量
         * --------------------------------------------------------
         */

        const stateName =
            parameters.state;


        if (!stateName) {
            throw new Error(
                "Process requires a state name."
            );
        }


        /*
         * 确认这个状态量确实存在。
         */

        if (
            !Object.prototype.hasOwnProperty.call(
                source.state,
                stateName
            )
        ) {
            throw new Error(
                `State "${stateName}" does not exist.`
            );
        }


        /*
         * --------------------------------------------------------
         * 2. 获取加工方式
         * --------------------------------------------------------
         */

        const mode =
            parameters.mode ?? "multiply";


        /*
         * 加工参数。
         */

        const value =
            Number(parameters.value);


        if (!Number.isFinite(value)) {
            throw new Error(
                "Process value must be a finite number."
            );
        }


        /*
         * --------------------------------------------------------
         * 3. 复制原状态
         * --------------------------------------------------------
         *
         * 只修改用户选择的状态量。
         */

        const newState = {
            ...source.state
        };


        const oldValue =
            Number(source.state[stateName]);


        if (!Number.isFinite(oldValue)) {
            throw new Error(
                `State "${stateName}" is not numeric.`
            );
        }


        /*
         * --------------------------------------------------------
         * 4. 执行加工
         * --------------------------------------------------------
         */

        let newValue;


        if (mode === "multiply") {

            /*
             *     x' = x × value
             */

            newValue =
                oldValue * value;

        } else if (mode === "add") {

            /*
             *     x' = x + value
             */

            newValue =
                oldValue + value;

        } else {

            throw new Error(
                `Unknown process mode: ${mode}`
            );
        }


        /*
         * --------------------------------------------------------
         * 5. 状态边界
         * --------------------------------------------------------
         *
         * Stability 当前定义为 [0, 1]。
         *
         * 其他状态量暂时不强制限制。
         */

        if (stateName === "stability") {
            newValue =
                Math.max(
                    0,
                    Math.min(
                        1,
                        newValue
                    )
                );
        }


        /*
         * Size 不能小于等于 0。
         */

        if (stateName === "size") {
            newValue =
                Math.max(
                    0.0001,
                    newValue
                );
        }


        newState[stateName] =
            newValue;


        /*
         * --------------------------------------------------------
         * 6. 返回世界变化
         * --------------------------------------------------------
         *
         * 不 consume
         * 不 output
         * 只 update
         */

        return {
            type: "process",

            update: [
                {
                    id: source.id,

                    state: newState
                }
            ],

            process: {
                state: stateName,

                mode,

                value,

                oldValue,

                newValue
            }
        };
    }
}