/* eslint-disable max-lines */
// https://medium.com/hypersphere-codes/conways-game-of-life-in-typescript-a955aec3bd49
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const width = window.innerWidth;
const height = window.innerHeight;
const columnsCount = Math.floor(width / 10);
const rowsCount = Math.floor(height / 10);
canvas.width = width;
canvas.height = height;
ctx.fillStyle = "#f73454";
ctx.strokeStyle = "#f73454";
ctx.lineWidth = 1;
let isPaused = false;
let gameSpeedMsLoop = 1000;
const prepareBoard = () => {
    const board = [];
    for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
        const row = [];
        for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
            row.push(false);
        }
        board.push(row);
    }
    return board;
};
let gameBoard = prepareBoard();
const clear = () => {
    ctx.clearRect(0, 0, width, height);
};
const drawBoard = (board) => {
    for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
        for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
            if (!board[columnNumber][rowNumber]) {
                continue;
            }
            ctx.fillRect(columnNumber * 10, rowNumber * 10, 10, 10);
        }
    }
};
const alive = (columnNumber, rowNumber) => {
    if (columnNumber < 0 ||
        columnNumber >= columnsCount ||
        rowNumber < 0 ||
        rowNumber >= rowsCount) {
        return 0;
    }
    return gameBoard[columnNumber][rowNumber] ? 1 : 0;
};
gameBoard[1][0] = true;
gameBoard[2][1] = true;
gameBoard[0][2] = true;
gameBoard[1][2] = true;
gameBoard[2][2] = true;
const nextGeneration = () => {
    const board = prepareBoard();
    for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
        for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
            let countLiveNeighbors = 0;
            for (const deltaRow of [-1, 0, 1]) {
                for (const deltaColumn of [-1, 0, 1]) {
                    if (!(deltaRow === 0 && deltaColumn === 0)) {
                        countLiveNeighbors += alive(columnNumber + deltaRow, rowNumber + deltaColumn);
                    }
                }
            }
            if (!alive(columnNumber, rowNumber)) {
                if (countLiveNeighbors === 3) {
                    board[columnNumber][rowNumber] = true;
                }
            }
            else {
                if (countLiveNeighbors == 2 || countLiveNeighbors == 3) {
                    board[columnNumber][rowNumber] = true;
                }
            }
        }
    }
    return board;
};
const drawAll = () => {
    clear();
    drawBoard(gameBoard);
};
const nextGen = () => {
    if (isPaused) {
        return;
    }
    gameBoard = nextGeneration();
    drawAll();
};
const nextGenLoop = () => {
    nextGen();
    setTimeout(nextGenLoop, gameSpeedMsLoop);
};
nextGenLoop();
let isDrawing = true;
let isMouseDown = false;
function getPositionFromEvent(mouseEvent) {
    const columnNumber = Math.floor((mouseEvent.clientX - canvas.offsetLeft) / 10);
    const rowNumber = Math.floor((mouseEvent.clientY - canvas.offsetTop) / 10);
    return [columnNumber, rowNumber];
}
canvas.addEventListener("mousedown", mouseEvent => {
    isMouseDown = true;
    const [columnNumber, rowNumber] = getPositionFromEvent(mouseEvent);
    isDrawing = !gameBoard[columnNumber][rowNumber];
    gameBoard[columnNumber][rowNumber] = isDrawing;
    drawAll();
});
canvas.addEventListener("mousemove", mouseEvent => {
    if (!isMouseDown) {
        return;
    }
    const [columnNumber, rowNumber] = getPositionFromEvent(mouseEvent);
    gameBoard[columnNumber][rowNumber] = isDrawing;
    drawAll();
});
canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
});
const generateRandom = () => {
    const board = prepareBoard();
    for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
        for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
            board[columnNumber][rowNumber] = Math.random() > 0.9;
        }
    }
    return board;
};
document.addEventListener("keydown", keyBoardEvent => {
    console.log(keyBoardEvent);
    if (keyBoardEvent.key === "p") {
        isPaused = !isPaused;
    }
    else if (keyBoardEvent.key === "+") {
        gameSpeedMsLoop = Math.max(50, gameSpeedMsLoop - 50);
    }
    else if (keyBoardEvent.key === "-") {
        gameSpeedMsLoop = Math.min(2000, gameSpeedMsLoop + 50);
    }
    else if (keyBoardEvent.key === "r") {
        gameBoard = generateRandom();
        drawAll();
    }
    else if (keyBoardEvent.key === "c") {
        gameBoard = prepareBoard();
        drawAll();
    }
});
/* MODAL */
const helpButton = document.querySelector("#help-btn");
const helpModal = document.querySelector("#help-msg");
const toggleModal = () => {
    helpModal.classList.toggle("hidden");
};
document.addEventListener("keydown", keyboardEvent => {
    if (keyboardEvent.key === "?") {
        toggleModal();
    }
});
helpButton.addEventListener("click", toggleModal);
