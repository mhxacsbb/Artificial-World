console.log("Artificial World initialized.");

const startButton = document.getElementById("startButton");
const stepButton = document.getElementById("stepButton");
const resetButton = document.getElementById("resetButton");

const tickElement = document.getElementById("tick");
const eventsElement = document.getElementById("events");

let tick = 0;

function step() {
    tick++;

    tickElement.textContent = tick;

    const event = document.createElement("div");
    event.className = "event";
    event.textContent = `Tick ${tick}: simulation step`;

    eventsElement.prepend(event);

    console.log(`Tick ${tick}`);
}

function reset() {
    tick = 0;

    tickElement.textContent = "0";
    eventsElement.innerHTML = "";

    console.log("World reset.");
}

stepButton.addEventListener("click", step);
resetButton.addEventListener("click", reset);

startButton.addEventListener("click", () => {
    step();
});