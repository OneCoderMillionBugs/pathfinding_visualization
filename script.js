const CELL = 30;

const WHITE  = "#FFFFFF";
const BLACK  = "#000000";
const GRAY   = "#808080";
const GREEN  = "rgb(1, 238, 170, .5)";

// Current drawing tool
// 0 - eraser, 1 - wall, 2 - start, 3 - end
const toolNames = ["Eraser", "Wall"];
let tool_last = 1;
let tool = 1;

// Algorithmic variables
const ALGO = {
    dfs: 0, bfs: 1, dijkstra: 2, a_star: 3
};
let algorithm = -1;     // Current algorithm (-1 means no algo selected)
let startPos = [0, 0];  // Starting position (row, col)
let endPos = [0, 1];    // Target position (row, col)
let path;               // An array containing path
let grid;               // An array containing grid info

// Global graphic variables
const ANIM_SPEED = {
    100: "Slow", 50: "Medium", 25: "Fast"
};
let start;      // start icon
let target;     // end icon
let canvas;     // canvas object
let ctx;        // 2d canvas-context
let backCanvas; // background canvas object
let backCtx;    // 2d background-canvas-context

let animating = false;  // Is the path animation on
let pathSpeed = 50;     // Speed of animation of drawing a path
let cellSpeed = 10;     // Speed of animation of drawing a single cell


function main() {

    start  = document.getElementById("start");
    target = document.getElementById("target");

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    backCanvas = document.getElementById("back_canvas");
    backCtx = backCanvas.getContext("2d");

    grid = clearGrid();

    let drawing  = false;
    let dragging = false;

    render();

    // Set up clean canvas on resizing browser window
    window.addEventListener("resize", function(event) {

        clearCanvas();
    });

    canvas.addEventListener("mousedown", function(event) {

        if (animating) {
            return;
        }
    
        drawing = true;
        let [i, j] = getMousePos(event);

        if (grid[i][j] > 1) {
            dragging = true;
            drawing = false;
            tool_last = tool;
            tool = grid[i][j];
            return;
        }
        draw(i, j);
    });

    canvas.addEventListener("mouseup", function(event) {

        if (animating) {
            return;
        }    

        if (dragging === true) {
            let [i, j] = getMousePos(event);

            if (grid[i][j] <= 1) {
                grid[i][j] = tool;
                clearDragTrace(i, j, tool);
            }
            render();
            tool = tool_last;
        }

        drawing  = false;
        dragging = false;
    });

    canvas.addEventListener("mousemove", function(event) {

        if (animating) {
            return;
        }    

        if (drawing === true) {
            let [i, j] = getMousePos(event);
            draw(i, j);
        }
        else if (dragging === true) {
            let [y, x] = getMousePos(event, format='f');
            render();
            ctx.drawImage(tool === 2 ? start : target, x, y, CELL * 0.6, CELL * 0.6);
        }
    });
}


function render() {

    backCtx.lineWidth = 0.2;
    backCtx.fillStyle = WHITE;
    backCtx.strokeStyle = GRAY;
    backCtx.fillRect(0, 0, backCanvas.width, backCanvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = BLACK;
                ctx.fillRect(j * CELL + 1, i * CELL + 1, CELL - 1, CELL - 1);
            }

            if (grid[i][j] > 1) {
                ctx.drawImage(grid[i][j] === 2 ? start : target, j * CELL, i * CELL, CELL, CELL);
            }
            backCtx.strokeRect(j * CELL, i * CELL, CELL, CELL);
        }
    }
}

// Refresh the grid and draw new canvas
function clearCanvas() {

    if (animating) {
        return;
    }

    grid = clearGrid();
    render();
}

// Return new grid (array) with all values set to 0,
// except the start and the end points
function clearGrid() {

    let [height, width] = resizeCanvas();
    grid = [];

    for (let i = 0; i < height / CELL; i++) {
        grid.push([]);
        for (let j = 0; j < width / CELL; j++) {
            grid[i].push(0);
        }
    }

    grid[0][0] = 2; // start
    grid[0][1] = 3; // target

    startPos = [0, 0];
    endPos = [0, 1];

    return grid;
}

// Resize the canvas (fore/background ones) to the closest possible
// integer size-values that are divisible by CELL
function resizeCanvas() {

    let canvGrid = document.getElementById("grid");

    let width = canvGrid.offsetWidth;
    let height = canvGrid.offsetHeight;

    canvas.width = width - width % CELL;
    canvas.height = height - height % CELL;

    backCanvas.width = canvas.width;
    backCanvas.height = canvas.height;

    return [canvas.height, canvas.width];
}

// Change single cell's value on click
function draw(i, j) {

    if (grid[i][j] > 1) {
        return;
    }

    if (tool === 1) {
        grid[i][j] = 1;
        ctx.fillStyle = BLACK;

        let size = CELL / 10;
        let cellAnim = setInterval(() => {
            ctx.fillRect(
                j * CELL + (CELL - size) / 2 + 1, 
                i * CELL + (CELL - size) / 2 + 1, 
                size - 1, size - 1
            );
            size += (CELL / 10);
            if (size > CELL) {
                clearInterval(cellAnim);
            }
        }, cellSpeed);
    }
    else if (tool === 0) {
        grid[i][j] = 0;
        ctx.clearRect(j * CELL, i * CELL, CELL, CELL);
    }
}

function getMousePos(event, format='d') {

    let rect = canvas.getBoundingClientRect();
    let j = event.clientX - rect.left;
    let i = event.clientY - rect.top;

    if (format === 'f' || format === 'd') {
        if (format === 'd') {
            i = parseInt(i / CELL);
            j = parseInt(j / CELL);
        }
        return [i, j];
    }
    return -1;
}

// Clear old start/end points that have been left after dragging
// r, c are the current coordinates (shouldn't be changed)
// Also update start/end point
function clearDragTrace(r, c, tool) {

    if (tool === 2) {
        startPos = [r, c];
    }
    else {
        endPos = [r, c];
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if ((i !== r || j !== c) && grid[i][j] === tool) {
                grid[i][j] = 0;
            }
        }
    }
}

// Tool selection
function changeTool(toolBtn) {

    if (++tool > 1) {
        tool = 0;
    }

    toolBtn.innerText = "Tool: " + toolNames[tool];
}

// Algorithm selection
function changeAlgorithm(algo) {

    let temp = algo.innerText;
    document.getElementById("algobtn").innerText = temp;

    switch (temp) {
        case "Depth First Search": algorithm = ALGO.dfs; break;
        case "Breath First Search": algorithm = ALGO.bfs; break;
        case "Dijkstra": algorithm = ALGO.dijkstra; break;
        case "A*": algorithm = ALGO.a_star; break;
    }
}

// Animation speed selection
function changeAnimationSpeed(speedBtn) {

    if (animating) {
        return;
    }

    pathSpeed /= 2;

    if (pathSpeed < 25) {
        pathSpeed = 100;
    }

    speedBtn.innerText = "Speed: " + ANIM_SPEED[pathSpeed];
}

// Run the path finding algorithm
function run() {

    if (animating) {
        return;
    }

    clearPath();

    switch (algorithm) {
        case ALGO.dfs: path = depthFirstSearch(startPos); break;
        case ALGO.bfs: path = breathFirstSearch(startPos); break;
        case ALGO.dijkstra: path = dijkstraSearch(); break;
        case ALGO.a_star: path = aStarSearch(); break;
        default: alert("Choose an algorithm!");
    }

    if (path.length > 0) {
        drawPath();
    }
}

// Draw a path that was found by algorithm
function drawPath() {

    ctx.fillStyle = GREEN;
    animating = true;

    for (let idx = 0; idx < path.length; idx++) {

        let [i, j] = path[idx];
        setTimeout(() => {
            let size = CELL / 10;
            let cellAnim = setInterval(() => {
                ctx.clearRect(j * CELL, i * CELL, CELL, CELL);
                ctx.fillRect(
                    j * CELL + (CELL - size) / 2, 
                    i * CELL + (CELL - size) / 2, 
                    size, size
                );
                size += (CELL / 10);
                if (size > CELL) {
                    clearInterval(cellAnim);
                }
            }, cellSpeed);
            
            if (idx === path.length - 1) {
                animating = false;
            }
        }, idx * pathSpeed);
    }
}

// Clear path
function clearPath() {

    if (animating) {
        return;
    }

    path = [];
    render();
}


// Algorithm implementations
function depthFirstSearch(current) {

    let [row, col] = current;
    let stack = [];
    let visited = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(false)
    );

    stack.push([row, col]);
    visited[row][col] = true;

    while (stack.length > 0) {

        if (!visited[row][col]) {
            stack.push([row, col]);
            visited[row][col] = true;
        }

        if (row === endPos[0] && col === endPos[1]) {
            stack.shift();
            stack.pop();
            return stack;
        }

        let up = (row > 0) ? true : false;
        let down = (row < grid.length - 1) ? true : false;
        let left = (col > 0) ? true : false;
        let right = (col < grid[0].length - 1) ? true : false;

        if (up && !visited[row - 1][col] && grid[row - 1][col] !== 1) {
            row--;
        }
        else if (down && !visited[row + 1][col] && grid[row + 1][col] !== 1) {
            row++;
        }
        else if (left && !visited[row][col - 1] && grid[row][col - 1] !== 1) {
            col--;
        }
        else if (right && !visited[row][col + 1] && grid[row][col + 1] !== 1) {
            col++;
        }
        else {
            stack.pop();
            if (stack.length > 0) {
                [row, col] = stack[stack.length - 1];
            }
        }
    }

    return null;
}

function breathFirstSearch(current) {

    let [row, col] = current;
    let queue = [];
    let visited = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(false)
    );
    let prev = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill([-1, -1])
    );

    queue.push([row, col]);
    visited[row][col] = true;

    while (queue.length > 0) {

        [row, col] = queue.shift();

        let up = (row > 0) ? true : false;
        let down = (row < grid.length - 1) ? true : false;
        let left = (col > 0) ? true : false;
        let right = (col < grid[0].length - 1) ? true : false;

        if (up && !visited[row - 1][col] && grid[row - 1][col] !== 1) {
            visited[row - 1][col] = true;
            queue.push([row - 1, col]);
            prev[row - 1][col] = [row, col];
        }
        if (down && !visited[row + 1][col] && grid[row + 1][col] !== 1) {
            visited[row + 1][col] = true;
            queue.push([row + 1, col]);
            prev[row + 1][col] = [row, col];
        }
        if (left && !visited[row][col - 1] && grid[row][col - 1] !== 1) {
            visited[row][col - 1] = true;
            queue.push([row, col - 1]);
            prev[row][col - 1] = [row, col];
        }
        if (right && !visited[row][col + 1] && grid[row][col + 1] !== 1) {
            visited[row][col + 1] = true;
            queue.push([row, col + 1]);
            prev[row][col + 1] = [row, col];
        }
    }

    if (prev[endPos[0]][endPos[1]] === null) {
        return null;
    }

    let temp = [endPos[0], endPos[1]];
    let reverse = [];

    while (temp[0] !== startPos[0] || temp[1] !== startPos[1]) {
        reverse.push(temp);
        temp = prev[temp[0]][temp[1]];
    }

    reverse.shift();
    return reverse.reverse();
}

function dijkstraSearch(current) {


}