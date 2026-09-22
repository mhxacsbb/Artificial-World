
import { World } from "./world.js";
import {
    CopyOperation,
    CreateOperation
} from "./creation.js";
import { ProcessOperation } from "./process.js";
import { Simulation } from "./simulation.js";


const world = new World();

world.initialize(4);


const simulation = new Simulation(
    world,
    {
        copy: new CopyOperation(),
        create: new CreateOperation(),
        process: new ProcessOperation()
    }
);


const entityList =
    document.getElementById("entityList");

const log =
    document.getElementById("log");

const seedDisplay =
    document.getElementById("seedDisplay");


/*
 * ============================================================
 * 基础世界显示
 * ============================================================
 */

function render() {

    seedDisplay.textContent =
        `Seed: ${world.seed}`;

    entityList.innerHTML = "";

    for (const entity of world.entities) {

        const item =
            document.createElement("div");

        item.className = "entity";

        item.innerHTML = `
            <div>
                <strong>Entity ${entity.id}</strong>
            </div>

            <div>
                Size:
                ${entity.state.size.toFixed(3)}
            </div>

            <div>
                Stability:
                ${entity.state.stability.toFixed(3)}
            </div>
        `;

        entityList.appendChild(item);
    }
}


/*
 * ============================================================
 * 日志
 * ============================================================
 */

function writeLog(message) {

    const line =
        document.createElement("div");

    line.textContent = message;

    log.prepend(line);
}


/*
 * ============================================================
 * 获取当前勾选的实体
 * ============================================================
 */

function getSelectedEntities() {

    const checkboxes =
        document.querySelectorAll(
            ".entity-select:checked"
        );

    return Array.from(checkboxes)
        .map(
            checkbox =>
                Number(checkbox.value)
        );
}


/*
 * ============================================================
 * 为 Copy / Create 生成实体选择框
 * ============================================================
 */

function renderSelectableEntities() {

    const operationPanel =
        document.getElementById(
            "operationEntities"
        );

    operationPanel.innerHTML = "";

    for (const entity of world.entities) {

        const label =
            document.createElement("label");

        label.innerHTML = `
            <input
                class="entity-select"
                type="checkbox"
                value="${entity.id}"
            >
            Entity ${entity.id}
        `;

        operationPanel.appendChild(label);
    }
}


/*
 * ============================================================
 * Process：生成加工对象列表
 * ============================================================
 */

function renderProcessEntities() {

    const select =
        document.getElementById(
            "processEntity"
        );

    const previousValue =
        select.value;

    select.innerHTML = `
        <option value="">
            请选择个体
        </option>
    `;

    for (const entity of world.entities) {

        const option =
            document.createElement("option");

        option.value =
            entity.id;

        option.textContent =
            `Entity ${entity.id}`;

        select.appendChild(option);
    }


    /*
     * 如果原来选择的实体仍然存在，
     * 尽量保持原来的选择。
     */

    const stillExists =
        world.entities.some(
            entity =>
                String(entity.id) ===
                previousValue
        );

    if (stillExists) {
        select.value =
            previousValue;
    }
}


/*
 * ============================================================
 * Process：生成状态量列表
 * ============================================================
 *
 * 状态量不是写死在 HTML 中。
 *
 * 页面读取当前实体的 state：
 *
 *     entity.state
 *
 * 有什么状态量，
 * 加工菜单里就出现什么状态量。
 */

function renderProcessStates() {

    const entitySelect =
        document.getElementById(
            "processEntity"
        );

    const stateSelect =
        document.getElementById(
            "processState"
        );

    const previousValue =
        stateSelect.value;

    stateSelect.innerHTML = `
        <option value="">
            请选择状态量
        </option>
    `;


    const entityId =
        Number(entitySelect.value);

    if (!entityId) {
        return;
    }


    const entity =
        world.getEntity(entityId);

    if (!entity) {
        return;
    }


    /*
     * 遍历当前个体的状态。
     */

    for (
        const stateName
        of Object.keys(entity.state)
    ) {

        const option =
            document.createElement("option");

        option.value =
            stateName;

        option.textContent =
            getStateDisplayName(stateName);

        stateSelect.appendChild(
            option
        );
    }


    /*
     * 如果原来选择的状态量仍然存在，
     * 保留选择。
     */

    const stateExists =
        Object.prototype.hasOwnProperty.call(
            entity.state,
            previousValue
        );

    if (stateExists) {
        stateSelect.value =
            previousValue;
    }
}


/*
 * ============================================================
 * 状态量显示名称
 * ============================================================
 */

function getStateDisplayName(stateName) {

    const names = {

        size:
            "Size（大小）",

        stability:
            "Stability（稳定性）"
    };

    return (
        names[stateName] ??
        stateName
    );
}


/*
 * ============================================================
 * Process：根据加工方式更新参数默认值
 * ============================================================
 */

function updateProcessValueDefault() {

    const mode =
        document.getElementById(
            "processMode"
        ).value;

    const input =
        document.getElementById(
            "processValue"
        );


    if (mode === "multiply") {

        /*
         * 乘法默认值。
         */

        input.value = "0.5";

    } else if (mode === "add") {

        /*
         * 加法默认值。
         */

        input.value = "0";
    }
}


/*
 * ============================================================
 * Process：执行加工
 * ============================================================
 */

function executeProcess() {

    const entityId =
        Number(
            document.getElementById(
                "processEntity"
            ).value
        );

    const state =
        document.getElementById(
            "processState"
        ).value;

    const mode =
        document.getElementById(
            "processMode"
        ).value;

    const value =
        Number(
            document.getElementById(
                "processValue"
            ).value
        );


    /*
     * 检查加工对象。
     */

    if (!entityId) {

        writeLog(
            "Process：请选择加工对象。"
        );

        return;
    }


    /*
     * 检查状态量。
     */

    if (!state) {

        writeLog(
            "Process：请选择加工状态量。"
        );

        return;
    }


    /*
     * 检查参数。
     */

    if (!Number.isFinite(value)) {

        writeLog(
            "Process：请输入有效的加工参数。"
        );

        return;
    }


    try {

        const result =
            simulation.execute(
                "process",
                [entityId],
                {
                    state,
                    mode,
                    value
                }
            );


        /*
         * 获取加工结果。
         */

        const process =
            result.process;


        writeLog(
            `Process：Entity ${entityId} `
            + `${getStateDisplayName(state)} `
            + `${mode === "multiply" ? "×" : "+"} `
            + `${value}；`
            + `${process.oldValue.toFixed(3)} `
            + `→ `
            + `${process.newValue.toFixed(3)}`
        );


        renderAll();


        /*
         * renderAll() 会重新生成列表，
         * 因此重新恢复当前实体和状态量。
         */

        document.getElementById(
            "processEntity"
        ).value =
            String(entityId);

        renderProcessStates();

        document.getElementById(
            "processState"
        ).value =
            state;

    } catch (error) {

        writeLog(
            `错误：${error.message}`
        );
    }
}


/*
 * ============================================================
 * 完整刷新
 * ============================================================
 */

function renderAll() {

    render();

    renderSelectableEntities();

    renderProcessEntities();

    renderProcessStates();
}


/*
 * ============================================================
 * Copy
 * ============================================================
 */

document
    .getElementById("copyButton")
    .addEventListener(
        "click",
        () => {

            const selected =
                getSelectedEntities();


            if (selected.length !== 1) {

                writeLog(
                    "Copy：请选择且只能选择一个个体。"
                );

                return;
            }


            const count =
                Number(
                    document.getElementById(
                        "copyCount"
                    ).value
                );


            if (
                !Number.isInteger(count) ||
                count < 1
            ) {

                writeLog(
                    "Copy：复制数量必须是大于等于 1 的整数。"
                );

                return;
            }


            try {

                simulation.execute(
                    "copy",
                    selected,
                    { count }
                );


                writeLog(
                    `Copy：Entity ${selected[0]} `
                    + `复制 ${count} 个。`
                );


                renderAll();

            } catch (error) {

                writeLog(
                    `错误：${error.message}`
                );
            }
        }
    );


/*
 * ============================================================
 * Create
 * ============================================================
 */

document
    .getElementById("createButton")
    .addEventListener(
        "click",
        () => {

            const selected =
                getSelectedEntities();


            if (selected.length < 2) {

                writeLog(
                    "Create：至少选择两个个体。"
                );

                return;
            }


            try {

                const result =
                    simulation.execute(
                        "create",
                        selected
                    );


                const weightText =
                    result.weights
                        .map(
                            weight =>
                                weight.toFixed(3)
                        )
                        .join(", ");


                writeLog(
                    `Create：输入 `
                    + `[${selected.join(", ")}] `
                    + `→ Entity `
                    + `${result.output[0].id}；`
                    + `权重 = [${weightText}]；`
                    + `输入个体已消耗。`
                );


                renderAll();

            } catch (error) {

                writeLog(
                    `错误：${error.message}`
                );
            }
        }
    );


/*
 * ============================================================
 * Process
 * ============================================================
 */

document
    .getElementById("processButton")
    .addEventListener(
        "click",
        executeProcess
    );


/*
 * 当加工对象改变时，
 * 重新读取该实体拥有的状态量。
 */

document
    .getElementById("processEntity")
    .addEventListener(
        "change",
        renderProcessStates
    );


/*
 * 当加工方式改变时，
 * 更新参数默认值。
 */

document
    .getElementById("processMode")
    .addEventListener(
        "change",
        updateProcessValueDefault
    );


/*
 * ============================================================
 * Reset
 * ============================================================
 */

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        () => {

            world.reset();

            world.initialize(4);

            log.innerHTML = "";

            writeLog(
                "世界已重新随机生成。"
            );

            renderAll();
        }
    );


/*
 * ============================================================
 * 初始化
 * ============================================================
 */

renderAll();

writeLog(
    "Artificial World 第一版已启动。"
);

writeLog(
    "基础个体由随机 Seed 生成。"
);

