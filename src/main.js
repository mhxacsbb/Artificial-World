import { World } from "./world.js";
import { Simulation } from "./simulation.js";
import { Rule } from "./rule.js";

console.log("Artificial World initialized.");


// ============================================================
// 1. 获取界面元素
// ============================================================

const startButton = document.getElementById("startButton");
const stepButton = document.getElementById("stepButton");
const run10Button = document.getElementById("run10Button");
const resetButton = document.getElementById("resetButton");

const tickElement = document.getElementById("tick");
const eventsElement = document.getElementById("events");
const worldElement = document.getElementById("world");


// ============================================================
// 2. 创建世界
// ============================================================

const world = new World();


// ============================================================
// 3. 定义世界规则
// ============================================================

// ------------------------------------------------------------
// 规则 1：能量 → 活动
// ------------------------------------------------------------

const energyToActivity = new Rule(
    "energy_to_activity",

    (entity) => {
        return entity.state.energy > 0;
    },

    (entity) => {
        return {
            entityId: entity.id,

            state: {
                energy: entity.state.energy - 1,
                activity: entity.state.activity + 1
            },

            event: {
                type: "state_change",
                entityId: entity.id,
                rule: "energy_to_activity",
                description:
                    `Entity ${entity.id}: energy → activity`
            }
        };
    }
);


// ------------------------------------------------------------
// 规则 2：活动 → 记忆
// ------------------------------------------------------------

const activityToMemory = new Rule(
    "activity_to_memory",

    (entity) => {
        return entity.state.activity > 0;
    },

    (entity) => {
        return {
            entityId: entity.id,

            state: {
                activity: entity.state.activity - 1,
                memory: entity.state.memory + 1
            },

            event: {
                type: "state_change",
                entityId: entity.id,
                rule: "activity_to_memory",
                description:
                    `Entity ${entity.id}: activity → memory`
            }
        };
    }
);


// ------------------------------------------------------------
// 规则 3：记忆 → 能量
// ------------------------------------------------------------

const memoryToEnergy = new Rule(
    "memory_to_energy",

    (entity) => {
        return entity.state.memory >= 3;
    },

    (entity) => {
        return {
            entityId: entity.id,

            state: {
                memory: entity.state.memory - 3,
                energy: entity.state.energy + 2
            },

            event: {
                type: "state_change",
                entityId: entity.id,
                rule: "memory_to_energy",
                description:
                    `Entity ${entity.id}: memory → energy`
            }
        };
    }
);


// ============================================================
// 4. 创建模拟器
// ============================================================

const simulation = new Simulation(
    world,
    [
        energyToActivity,
        activityToMemory,
        memoryToEnergy
    ]
);


// ============================================================
// 5. 实验历史记录
// ============================================================

let history = [];


// ============================================================
// 6. 记录当前世界状态
// ============================================================

function recordHistory() {

    const snapshot = {
        tick: world.tick,

        entities: world.entities.map(entity => ({
            id: entity.id,
            type: entity.type,
            state: {
                ...entity.state
            }
        })),

        events: world.events.map(event => ({
            type: event.type,
            entityId: event.entityId,
            rule: event.rule,
            description: event.description
        }))
    };

    history.push(snapshot);
}


// ============================================================
// 7. 更新界面
// ============================================================

function render() {

    tickElement.textContent = world.tick;

    // --------------------------------------------------------
    // 世界显示
    // --------------------------------------------------------

    worldElement.innerHTML = "";

    for (const entity of world.entities) {

        const element = document.createElement("div");

        element.className = "entity";

        element.innerHTML = `
            <strong>Entity ${entity.id}</strong>
            <br>
            Type: ${entity.type}
            <br>
            Energy: ${entity.state.energy}
            <br>
            Activity: ${entity.state.activity}
            <br>
            Memory: ${entity.state.memory}
        `;

        element.style.position = "absolute";
        element.style.left = `${100 + entity.id * 180}px`;
        element.style.top = "150px";

        worldElement.appendChild(element);
    }


    // --------------------------------------------------------
    // 事件显示
    // --------------------------------------------------------

    eventsElement.innerHTML = "";

    for (const event of [...world.events].reverse()) {

        const element = document.createElement("div");

        element.className = "event";

        element.textContent =
            `Tick ${world.tick}: ${event.description}`;

        eventsElement.appendChild(element);
    }
}


// ============================================================
// 8. 单步运行
// ============================================================

function step() {

    simulation.step();

    recordHistory();

    render();

    console.log(
        `Tick ${world.tick}`,
        world.entities
    );
}


// ============================================================
// 9. 重置世界
// ============================================================

function reset() {

    simulation.reset();

    history = [];

    recordHistory();

    render();

    console.log("World reset.");
}


// ============================================================
// 10. 运行完整 10 Tick 实验
// ============================================================

function run10Ticks() {

    console.log("========================================");
    console.log("Starting 10 Tick experiment");
    console.log("========================================");


    // --------------------------------------------------------
    // 每次实验从完全相同的初始状态开始
    // --------------------------------------------------------

    simulation.reset();

    history = [];

    recordHistory();


    // --------------------------------------------------------
    // 连续运行 10 Tick
    // --------------------------------------------------------

    for (let i = 0; i < 10; i++) {

        simulation.step();

        recordHistory();
    }


    // --------------------------------------------------------
    // 最后统一更新界面
    // --------------------------------------------------------

    render();


    // --------------------------------------------------------
    // 输出完整实验结果
    // --------------------------------------------------------

    console.log("10 Tick experiment finished.");

    console.log(
        "Simulation history:",
        history
    );


    // --------------------------------------------------------
    // 自动生成 JSON 日志
    // --------------------------------------------------------

    downloadLog();
}


// ============================================================
// 11. 下载实验日志
// ============================================================

function downloadLog() {

    const log = {

        experiment: {
            name: "Artificial World - Echo Experiment",
            version: "0.1",
            totalTicks: 10
        },

        rules: [
            "energy_to_activity",
            "activity_to_memory",
            "memory_to_energy"
        ],

        history: history
    };


    const json = JSON.stringify(
        log,
        null,
        2
    );


    const blob = new Blob(
        [json],
        {
            type: "application/json"
        }
    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "simulation-log.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    console.log(
        "Simulation log downloaded."
    );
}


// ============================================================
// 12. 按钮事件
// ============================================================

stepButton.addEventListener(
    "click",
    step
);


resetButton.addEventListener(
    "click",
    reset
);


startButton.addEventListener(
    "click",
    step
);


if (run10Button) {

    run10Button.addEventListener(
        "click",
        run10Ticks
    );
}


// ============================================================
// 13. 初始化
// ============================================================

simulation.reset();

history = [];

recordHistory();

render();