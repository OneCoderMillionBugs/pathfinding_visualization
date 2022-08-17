const CELL = 30;
const WEIGHT = 10;

const WHITE  = "#FFFFFF";
const BLACK  = "#000000";
const GRAY   = "#808080";
const GREEN  = "rgb(1, 238, 170, .5)";

// Current drawing tool
// 0 - eraser, 1 - wall, 2 - weight, 3 - start, 4 - end
const toolNames = ["Eraser", "Wall", "Weight"];
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
let weight;     // weight icon
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
    weight = document.getElementById("weight");

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

        if (grid[i][j] > 2) {
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

            if (grid[i][j] <= 2) {
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
            ctx.drawImage(tool === 3 ? start : target, x, y, CELL * 0.6, CELL * 0.6);
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
            else if (grid[i][j] === 2) {
                ctx.drawImage(weight, j * CELL, i * CELL, CELL, CELL);
            }
            else if (grid[i][j] > 2) {
                ctx.drawImage(grid[i][j] === 3 ? start : target, j * CELL, i * CELL, CELL, CELL);
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

    grid[0][0] = 3; // start
    grid[0][1] = 4; // target

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

    if (grid[i][j] > 2 || grid[i][j] === tool) {
        return;
    }

    ctx.clearRect(j * CELL, i * CELL, CELL, CELL);

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
    else if (tool === 2) {
        grid[i][j] = 2;

        let size = CELL / 10;
        let cellAnim = setInterval(() => {
            ctx.clearRect(j * CELL, i * CELL, CELL, CELL);
            ctx.drawImage(
                weight,
                j * CELL + (CELL - size) / 2,
                i * CELL + (CELL - size) / 2,
                size, size
            );
            size += (CELL / 10);
            if (size > CELL) {
                clearInterval(cellAnim);
            }
        }, cellSpeed);
    }
    else if (tool === 0) {
        grid[i][j] = 0;
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

    if (tool === 3) {
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

    if (++tool > 2) {
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
        case ALGO.dijkstra: path = dijkstraSearch(startPos); break;
        case ALGO.a_star: path = aStarSearch(startPos); break;
        default: alert("Choose an algorithm!");
    }

    if (path === null) {
        alert("Path not found!");
    }
    else if (path.length > 0) {
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

                if (grid[i][j] === 2) {
                    ctx.drawImage(weight, j * CELL, i * CELL, CELL, CELL);
                }
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


// Generate random integer in some range
function random(max) {

    return parseInt(Math.random() * max, 10);
}

// Shuffle an array
function shuffle(arr) {

    let currentIndex = 0;

    for (let i = 0; i < arr.length; i++) {
        let randomIndex = parseInt(Math.random() * arr.length);
        let temp = arr[randomIndex];
        arr[randomIndex] = arr[currentIndex];
        arr[currentIndex] = temp;
    }
}

// Create a maze
function generateMaze(maze) {

    if (animating) {
        return;
    }

    switch (maze.innerText) {
        case "Randomized DFS": mazeDFS(); break;
        case "Basic Random": mazeRandom(0.25); break;
        case "Recursive Division": recursiveDivision(); break;
    }

    render();
}


// Basic Random maze
function mazeRandom(density) {

    let n = grid.length;
    let m = grid[0].length;
    let count = n * m * density;

    grid = Array(n).fill().map(
        () => Array(m).fill(0)
    )

    do {
        startPos = [random(n), random(m)];
        endPos = [random(n), random(m)];
    }
    while (startPos[0] === endPos[0] && startPos[1] === endPos[1]);

    grid[startPos[0]][startPos[1]] = 3;
    grid[endPos[0]][endPos[1]] = 4;

    while (count--) {

        let [i, j] = [null, null];

        do {
            [i, j] = [random(n), random(m)];
        }
        while ((i === startPos[0] && j === startPos[1]) || (i === endPos[0] && j === endPos[1]));
        grid[i][j] = 1;
    }
}

// Randomized dfs for generating a maze
function mazeDFS() {

    // Generate the new grid and set the start/target points
    let n = grid.length;
    let m = grid[0].length;
    let available = [];
    grid = Array(n).fill().map(
        () => Array(m).fill(1)
    )

    for (let r = 0; r < n; r += 2) {
        for (let c = 0; c < m; c += 2) {
            grid[r][c] = 0;
            available.push([r, c]);
        }
    }

    do {
        startPos = available[random(available.length)];
        endPos = available[random(available.length)];
    }
    while (startPos[0] === endPos[0] && startPos[1] === endPos[1]);

    grid[startPos[0]][startPos[1]] = 3;
    grid[endPos[0]][endPos[1]] = 4;

    // Randomized dfs
    let [row, col] = startPos;
    let stack = [];
    let visited = Array(n).fill().map(
        () => Array(m).fill(false)
    );

    stack.push([row, col]);
    visited[row][col] = true;

    while (stack.length > 0) {

        if (!visited[row][col]) {
            stack.push([row, col]);
            visited[row][col] = true;
        }

        hasDirection = false;

        directions = [
            () => {
                if ((row > 1) && !visited[row - 2][col] && !hasDirection) {
                    grid[row - 1][col] = 0;
                    row -= 2;
                    hasDirection = true;
                }
            },
            () => {
                if ((row < n - 2) && !visited[row + 2][col] && !hasDirection) {
                    grid[row + 1][col] = 0;
                    row += 2;
                    hasDirection = true;
                }
            },
            () => {
                if ((col > 1) && !visited[row][col - 2] && !hasDirection) {
                    grid[row][col - 1] = 0;
                    col -= 2;
                    hasDirection = true;
                }
            },
            () => {
                if ((col < m - 2) && !visited[row][col + 2] && !hasDirection) {
                    grid[row][col + 1] = 0;
                    col += 2;
                    hasDirection = true;
                }
            }
        ];

        shuffle(directions);
        for (let i = 0; i < directions.length; i++) {
            directions[i]();
        }

        if (!hasDirection) {
            stack.pop();
            if (stack.length > 0) {
                [row, col] = stack[stack.length - 1];
            }
        }
    }
}

// A helper function to get the orientation of the grid

const HORIZONTAL = 1;
const VERTICAL = 0;

function getOrientation(width, height) {

    if (width > height) {
        return HORIZONTAL;
    }
    return VERTICAL;
}

// Recursive division for generating a maze
function recursiveDivision() {

    let n = grid.length;
    let m = grid[0].length;

    grid = Array(n).fill().map(
        () => Array(m).fill(0)
    );

    for (let i = 0; i < m; i++) {
        grid[0][i] = 1;
        grid[n - 1][i] = 1;
    }

    for (let i = 0; i < n; i++) {
        grid[i][0] = 1;
        grid[i][m - 1] = 1;
    }

    divide(1, 1, grid.length - 2, grid[0].length - 2, getOrientation(grid[0].length, grid.length));

    let available = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grid[i][j] === 0) {
                available.push([i, j]);
            }
        }
    }

    do {
        startPos = available[parseInt(Math.random() * available.length)];
        endPos = available[parseInt(Math.random() * available.length)];
    }
    while (startPos[0] === endPos[0] && startPos[1] === endPos[1]);

    grid[startPos[0]][startPos[1]] = 3;
    grid[endPos[0]][endPos[1]] = 4;
}

function divide(r, c, height, width, horizontal) {

    if (width < 2 || height < 2) {
        return;
    }

    let wr = r;
    let wc = c;
    let wpoints = [];

    if (horizontal) {
        wc++;
        while (wc < c + width - 1) {
            if (grid[wr + height][wc] === 1 && grid[wr - 1][wc] === 1) {
                wpoints.push([wr, wc]);
            }
            wc++;
        }
    }
    else {
        wr++;
        while (wr < r + height - 1) {
            if (grid[wr][wc + width] === 1 && grid[wr][wc - 1] === 1) {
                wpoints.push([wr, wc]);
            }
            wr++;
        }
    }

    if (wpoints.length === 0) {
        return;
    }

    [wr, wc] = wpoints[parseInt(Math.random() * wpoints.length)];
    let dr = horizontal ? 1 : 0;
    let dc = horizontal ? 0 : 1;
    let pr = horizontal ? wr + parseInt(Math.random() * height) : wr;
    let pc = horizontal ? wc : wc + parseInt(Math.random() * width);

    while (wr < r + height && wc < c + width) {
        grid[wr][wc] = (wr !== pr || wc !== pc) ? 1 : 0;
        wr += dr;
        wc += dc;
    }

    let [nr, nc] = [r, c];
    let [h, w] = horizontal ? [height, wc - c] : [wr - r, width];
    divide(nr, nc, h, w, getOrientation(w, h));

    [nr, nc] = horizontal ? [r, wc + 1] : [wr + 1, c];
    [h, w] = horizontal ? [height, c + width - wc - 1] : [r + height - wr - 1, width];
    divide(nr, nc, h, w, getOrientation(w, h));
}


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

    if (prev[endPos[0]][endPos[1]][0] === -1 && prev[endPos[0]][endPos[1]][1] === -1) {
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

    let [row, col] = current;

    let cost = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(Number.MAX_SAFE_INTEGER)
    );
    
    let visited = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(false)
    );

    let prev = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill([-1, -1])
    );

    cost[row][col] = 0;

    while (current !== null && (current[0] !== endPos[0] || current[1] !== endPos[1])) {

        [row, col] = current;
        visited[row][col] = true;

        let up = (row > 0) ? true : false;
        let down = (row < grid.length - 1) ? true : false;
        let left = (col > 0) ? true : false;
        let right = (col < grid[0].length - 1) ? true : false;

        if (up && !visited[row - 1][col] && grid[row - 1][col] !== 1) {
            let newCost = (grid[row - 1][col] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row - 1][col]) {
                cost[row - 1][col] = newCost;
                prev[row - 1][col] = [row, col];
            }
        }
        if (down && !visited[row + 1][col] && grid[row + 1][col] !== 1) {
            let newCost = (grid[row + 1][col] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row + 1][col]) {
                cost[row + 1][col] = newCost;
                prev[row + 1][col] = [row, col];
            }
        }
        if (left && !visited[row][col - 1] && grid[row][col - 1] !== 1) {
            let newCost = (grid[row][col - 1] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row][col - 1]) {
                cost[row][col - 1] = newCost;
                prev[row][col - 1] = [row, col];
            }
        }
        if (right && !visited[row][col + 1] && grid[row][col + 1] !== 1) {
            let newCost = (grid[row][col + 1] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row][col + 1]) {
                cost[row][col + 1] = newCost;
                prev[row][col + 1] = [row, col];
            }
        }

        let min = Number.MAX_SAFE_INTEGER;
        let [iMin, jMin] = [-1, -1];

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                if (!visited[i][j] && cost[i][j] < min) {
                    min = cost[i][j];
                    iMin = i;
                    jMin = j;
                }
            }
        }

        current = (min != Number.MAX_SAFE_INTEGER)
                ? [iMin, jMin]
                : null;
    }

    if (prev[endPos[0]][endPos[1]][0] === -1 && prev[endPos[0]][endPos[1]][1] === -1) {
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

function aStarSearch(current) {

    let [row, col] = current;

    let cost = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(Number.MAX_SAFE_INTEGER)
    );
    
    let visited = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill(false)
    );

    let prev = Array(grid.length).fill().map(
        () => Array(grid[0].length).fill([-1, -1])
    );

    cost[row][col] = 0;

    while (current !== null && (current[0] !== endPos[0] || current[1] !== endPos[1])) {

        [row, col] = current;
        visited[row][col] = true;

        let up = (row > 0) ? true : false;
        let down = (row < grid.length - 1) ? true : false;
        let left = (col > 0) ? true : false;
        let right = (col < grid[0].length - 1) ? true : false;

        if (up && !visited[row - 1][col] && grid[row - 1][col] !== 1) {
            let newCost = (grid[row - 1][col] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row - 1][col]) {
                cost[row - 1][col] = newCost;
                prev[row - 1][col] = [row, col];
            }
        }
        if (down && !visited[row + 1][col] && grid[row + 1][col] !== 1) {
            let newCost = (grid[row + 1][col] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row + 1][col]) {
                cost[row + 1][col] = newCost;
                prev[row + 1][col] = [row, col];
            }
        }
        if (left && !visited[row][col - 1] && grid[row][col - 1] !== 1) {
            let newCost = (grid[row][col - 1] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row][col - 1]) {
                cost[row][col - 1] = newCost;
                prev[row][col - 1] = [row, col];
            }
        }
        if (right && !visited[row][col + 1] && grid[row][col + 1] !== 1) {
            let newCost = (grid[row][col + 1] === 0 ? 1 : WEIGHT) + cost[row][col];
            if (newCost < cost[row][col + 1]) {
                cost[row][col + 1] = newCost;
                prev[row][col + 1] = [row, col];
            }
        }

        let min = Number.MAX_SAFE_INTEGER;
        let [iMin, jMin] = [-1, -1];

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {

                let manhattan = Math.abs(i - endPos[0]) + Math.abs(j - endPos[1]);
                let temp = cost[i][j] + manhattan;

                if (!visited[i][j] && temp < min) {
                    min = temp;
                    iMin = i;
                    jMin = j;
                }
            }
        }

        current = (min != Number.MAX_SAFE_INTEGER)
                ? [iMin, jMin]
                : null;
    }

    if (prev[endPos[0]][endPos[1]][0] === -1 && prev[endPos[0]][endPos[1]][1] === -1) {
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