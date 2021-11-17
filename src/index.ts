/* eslint-disable max-lines */

// 🚧 Reduce complexity
// 🚧 Use functional programming style
// 🚧 No global variables

// https://medium.com/hypersphere-codes/conways-game-of-life-in-typescript-a955aec3bd49
const CANVAS_CONFIG = {
  id: "#game",
  tileLength: 10,
  fillStyle: "#f73454",
  strokeStyle: "#f73454",
  lineWidth: 1,
};

const GAME_SETTINGS = {
  initialSpeedLoopMs: 1000,
  maximumSpeedLoopMs: 50,
  minimumSpeedLoopMs: 200,
  deltaSpeedMs: 50,
};

const LIVING_RULES = {
  minimumNeighborsToKeepAlive: 2,
  maximumNeighborsToKeepAlive: 3,
  neededNeighborsToBorn: 3,
  alive: true,
  dead: false,
  randomLivingChance: 0.9,
  neighborDeltas: [-1, 0, 1],
};

const HELP_ELEMENTS = {
  buttonId: "#help-btn",
  modalId: "#help-msg",
};
const PAUSE_KEY = "p";
const INCREASE_KEY = "+";
const DECREASE_KEY = "-";
const RANDOM_KEY = "r";
const CLEAR_KEY = "c";
const HELP_KEY = "?";

// 🚧 Keep this global variable for now 🚧
const gameStatus = {
  isPaused: false,
  speedLoopMs: GAME_SETTINGS.initialSpeedLoopMs,
};
const mouseState = {
  current: LIVING_RULES.alive,
  isDown: false,
};
let gameBoard: boolean[][];

//  ✅ Function for initialize the game
initializeGame();

// ✅ Enclose every instruction in a function
function initializeGame() {
  console.log("initialization");
  const canvas = document.querySelector<HTMLCanvasElement>(CANVAS_CONFIG.id);
  if (!canvas) return;
  const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (!context) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const columnsCount = Math.floor(width / CANVAS_CONFIG.tileLength);
  const rowsCount = Math.floor(height / CANVAS_CONFIG.tileLength);
  const startPaused = false;
  // ✅ Send everything to requesters
  gameBoard = prepareBoard(columnsCount, rowsCount);
  initializeCanvas(canvas, context, width, height);
  wireCanvasEventHandlers(canvas, context);
  wireDocumentEventHandlers(document);
  initializeBoard(gameBoard);
  drawBoard(context, gameBoard);
  initializeHelp(document);
  performLoop(context, startPaused);
}

// ✅ Ask for your dependencies
// ✅ Use function declaration for first class functions

function initializeCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = CANVAS_CONFIG.fillStyle;
  context.strokeStyle = CANVAS_CONFIG.strokeStyle;
  context.lineWidth = CANVAS_CONFIG.lineWidth;
}

function initializeBoard(gameBoard: boolean[][]) {
  gameBoard[0][2] = LIVING_RULES.alive;
  gameBoard[1][0] = LIVING_RULES.alive;
  gameBoard[1][2] = LIVING_RULES.alive;
  gameBoard[2][1] = LIVING_RULES.alive;
  gameBoard[2][2] = LIVING_RULES.alive;
}

function prepareBoard(columnsCount: number, rowsCount: number): boolean[][] {
  const board = [];
  for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
    const row = [];
    for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
      row.push(LIVING_RULES.dead);
    }
    board.push(row);
  }
  return board;
}

function clearCanvas(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.clearRect(0, 0, width, height);
}

function drawBoard(context: CanvasRenderingContext2D, gameBoard: boolean[][]) {
  const columnsCount: number = gameBoard.length;
  const rowsCount: number = gameBoard[0].length;
  for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
    for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
      drawCell(context, gameBoard, rowNumber, columnNumber);
    }
  }
}

function drawCell(
  context: CanvasRenderingContext2D,
  gameBoard: boolean[][],
  rowNumber: number,
  columnNumber: number
) {
  if (isAlive(gameBoard, columnNumber, rowNumber)) {
    context.fillRect(
      columnNumber * CANVAS_CONFIG.tileLength,
      rowNumber * CANVAS_CONFIG.tileLength,
      CANVAS_CONFIG.tileLength,
      CANVAS_CONFIG.tileLength
    );
  }
}

function isAlive(
  gameBoard: boolean[][],
  columnNumber: number,
  rowNumber: number
): boolean {
  const columnsCount: number = gameBoard.length;
  const rowsCount: number = gameBoard[0].length;
  if (isInsideBoard(columnNumber, rowNumber, columnsCount, rowsCount)) {
    return gameBoard[columnNumber][rowNumber];
  } else {
    return false;
  }
}

function isInsideBoard(
  columnNumber: number,
  rowNumber: number,
  columnsCount: number,
  rowsCount: number
): boolean {
  if (columnNumber < 0) return false;
  if (columnNumber >= columnsCount) return false;
  if (rowNumber < 0) return false;
  if (rowNumber >= rowsCount) return false;
  return true;
}

function calculateNextGeneration(currentBoard: boolean[][]): boolean[][] {
  const columnsCount: number = currentBoard.length;
  const rowsCount: number = currentBoard[0].length;
  const nextGameBoard = prepareBoard(columnsCount, rowsCount);
  for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
    for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
      const newCellState = calculateNextGenerationCell(
        currentBoard,
        rowNumber,
        columnNumber
      );
      nextGameBoard[columnNumber][rowNumber] = newCellState;
    }
  }
  return nextGameBoard;
}

function calculateNextGenerationCell(
  gameBoard: boolean[][],
  rowNumber: number,
  columnNumber: number
) {
  let numberOfLivingNeighbors = 0;
  for (const deltaRow of LIVING_RULES.neighborDeltas) {
    for (const deltaColumn of LIVING_RULES.neighborDeltas) {
      const hasLivingNeighbor = hasLiveNeighbor(
        gameBoard,
        deltaRow,
        deltaColumn,
        columnNumber,
        rowNumber
      );
      numberOfLivingNeighbors += hasLivingNeighbor ? 1 : 0;
    }
  }
  return getNewGenerationCellState(
    gameBoard,
    rowNumber,
    columnNumber,
    numberOfLivingNeighbors
  );
}

function hasLiveNeighbor(
  gameBoard: boolean[][],
  deltaRow: number,
  deltaColumn: number,
  columnNumber: number,
  rowNumber: number
): boolean {
  if (isNotMe(deltaRow, deltaColumn)) {
    if (isAlive(gameBoard, columnNumber + deltaColumn, rowNumber + deltaRow)) {
      return true;
    }
  }
  return false;
}

function getNewGenerationCellState(
  gameBoard: boolean[][],
  rowNumber: number,
  columnNumber: number,
  numberOfLivingNeighbors: number
) {
  if (isAlive(gameBoard, columnNumber, rowNumber)) {
    if (canKeepAlive(numberOfLivingNeighbors)) {
      return LIVING_RULES.alive;
    }
  } else {
    if (canBorn(numberOfLivingNeighbors)) {
      return LIVING_RULES.alive;
    }
  }
  return LIVING_RULES.dead;
}

function canKeepAlive(numberOfLivingNeighbors: number): boolean {
  const isMinimum =
    numberOfLivingNeighbors == LIVING_RULES.minimumNeighborsToKeepAlive;
  const isMaximum =
    numberOfLivingNeighbors == LIVING_RULES.maximumNeighborsToKeepAlive;
  return isMinimum || isMaximum;
}
function canBorn(countLiveNeighbors: number): boolean {
  return countLiveNeighbors == LIVING_RULES.neededNeighborsToBorn;
}

function isNotMe(deltaRow: number, deltaColumn: number): boolean {
  const hasHorizontalDelta = deltaRow !== 0;
  const hasVerticalDelta = deltaColumn !== 0;
  return hasHorizontalDelta || hasVerticalDelta;
}

function redrawGameCanvas(
  context: CanvasRenderingContext2D,
  gameBoard: boolean[][]
) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  clearCanvas(context, width, height);
  drawBoard(context, gameBoard);
}

function drawNextGeneration(
  context: CanvasRenderingContext2D,
  isPaused: boolean,
  gameBoard: boolean[][]
): boolean[][] {
  const nextGameBoard = calculateNextGeneration(gameBoard);
  redrawGameCanvas(context, nextGameBoard);
  return nextGameBoard;
}

async function performLoop(
  context: CanvasRenderingContext2D,
  isPaused: boolean
) {
  // 🚧 Accessing global variables 🚧
  if (isPaused) {
    return;
  }
  const newBoard: boolean[][] = drawNextGeneration(
    context,
    isPaused,
    gameBoard
  );
  gameBoard = newBoard;
  setTimeout(performLoop, gameStatus.speedLoopMs, context, isPaused, gameBoard);
}

/* Canvas user interaction */

// ✅ Homogenize event handlers
function getPositionFromMouseEvent(
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
) {
  const horizontalPixel = getHorizontalPixelFromMouseEvent(mouseEvent, canvas);
  const columnNumber = getTileNumberFromPixel(horizontalPixel);
  const verticalPixel = getVerticalPixelFromMouseEvent(mouseEvent, canvas);
  const rowNumber = getTileNumberFromPixel(verticalPixel);
  return [columnNumber, rowNumber];
}
function getHorizontalPixelFromMouseEvent(
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
) {
  return mouseEvent.clientX - canvas.offsetLeft;
}
function getVerticalPixelFromMouseEvent(
  mouseEvent: MouseEvent,
  canvas: HTMLCanvasElement
) {
  return mouseEvent.clientY - canvas.offsetTop;
}
function getTileNumberFromPixel(pixel: number) {
  return Math.floor(pixel / CANVAS_CONFIG.tileLength);
}

function wireCanvasEventHandlers(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  // 🚧 Accessing global variable gameBoard 🚧
  canvas.addEventListener("mousedown", mouseEvent => {
    mouseState.isDown = true;
    const [columnNumber, rowNumber] = getPositionFromMouseEvent(
      mouseEvent,
      canvas
    );
    const stateAtMousePosition = gameBoard[columnNumber][rowNumber];
    const newToggledState = !stateAtMousePosition;
    gameBoard[columnNumber][rowNumber] = newToggledState;
    mouseState.current = newToggledState;
    redrawGameCanvas(context, gameBoard);
  });
  canvas.addEventListener("mousemove", mouseEvent => {
    if (mouseState.isDown) {
      const [columnNumber, rowNumber] = getPositionFromMouseEvent(
        mouseEvent,
        canvas
      );
      gameBoard[columnNumber][rowNumber] = mouseState.current;
      redrawGameCanvas(context, gameBoard);
    }
  });
  canvas.addEventListener("mouseup", () => {
    mouseState.isDown = false;
  });
}

function wireDocumentEventHandlers(document: Document) {
  document.addEventListener("keydown", keyBoardEvent => {
    const keyPressed = keyBoardEvent.key;
    const allowedKeys = Object.keys(keyActions);
    if (allowedKeys.includes(keyPressed)) {
      const action = keyActions[keyPressed];
      action();
    }
  });
}
/** Menu listeners */

const keyActions: Record<string, () => void> = {
  [PAUSE_KEY]: () => {
    gameStatus.isPaused = !gameStatus.isPaused;
  },
  [INCREASE_KEY]: () => {
    gameStatus.speedLoopMs = Math.max(
      GAME_SETTINGS.maximumSpeedLoopMs,
      gameStatus.speedLoopMs - GAME_SETTINGS.deltaSpeedMs
    );
  },
  [DECREASE_KEY]: () => {
    gameStatus.speedLoopMs = Math.min(
      GAME_SETTINGS.minimumSpeedLoopMs,
      gameStatus.speedLoopMs + GAME_SETTINGS.deltaSpeedMs
    );
  },
  [RANDOM_KEY]: () => {
    // 🚧 Accessing global variable gameBoard 🚧
    gameBoard = generateRandomGameBoard(gameBoard);
  },
  [CLEAR_KEY]: () => {
    // 🚧 Accessing global variable gameBoard 🚧
    const columnsCount: number = gameBoard.length;
    const rowsCount: number = gameBoard[0].length;
    gameBoard = prepareBoard(columnsCount, rowsCount);
  },
};

function generateRandomGameBoard(gameBoard: boolean[][]) {
  const columnsCount: number = gameBoard.length;
  const rowsCount: number = gameBoard[0].length;
  const randomGameBoard = prepareBoard(columnsCount, rowsCount);
  for (let columnNumber = 0; columnNumber < columnsCount; columnNumber++) {
    for (let rowNumber = 0; rowNumber < rowsCount; rowNumber++) {
      const isRandomlyAlive = Math.random() > LIVING_RULES.randomLivingChance;
      randomGameBoard[columnNumber][rowNumber] = isRandomlyAlive;
    }
  }
  return randomGameBoard;
}

/* Help button and modal */
function initializeHelp(document: Document) {
  const helpButton = document.querySelector(HELP_ELEMENTS.buttonId);
  const helpModal = document.querySelector(HELP_ELEMENTS.modalId);

  const toggleHelpModal = () => {
    helpModal?.classList.toggle("hidden");
  };
  helpButton?.addEventListener("click", toggleHelpModal);
  document.addEventListener("keydown", keyboardEvent => {
    if (keyboardEvent.key === HELP_KEY) {
      toggleHelpModal();
    }
  });
}
