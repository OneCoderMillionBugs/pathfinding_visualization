const CELL = 40;

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const GRAY  = "#808080";

// Current drawing tool
// 0 - eraser, 1 - wall, 2 - start, 3 - end
let tool_last = 1;
let tool = 1;
const toolNames = ["Eraser", "Wall"];


function main() {
    
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let grid = clearCanvas(canvas);

    render(grid, ctx, canvas);

    let drawing  = false;
    let dragging = false;

    // Set up clean canvas on resizing browser window
    window.addEventListener("resize", function(event) {

        grid = clearCanvas(canvas);
        render(grid, ctx, canvas);
    });

    canvas.addEventListener("mousedown", function(event) {

        drawing = true;
        let [i, j] = getMousePos(canvas, event);

        if (grid[i][j] > 1) {
            dragging = true;
            drawing = false;
            tool_last = tool;
            tool = grid[i][j];
            return;
        }
        draw(grid, ctx, i, j);
    });

    canvas.addEventListener("mouseup", function(event) {

        drawing  = false;
        dragging = false;
        tool = tool_last;
    });

    canvas.addEventListener("mousemove", function(event) {

        if (drawing === true) {
            let [i, j] = getMousePos(canvas, event);
            draw(grid, ctx, i, j);
        }
        else if (dragging === true) {
            let [i, j] = getMousePos(canvas, event);
        }
    });
}

// Return new grid with all values set to 0,
// except the start and end points
function clearCanvas(canvas) {

    let size = resizeCanvas(canvas); // height, width
    grid = [];

    for (let i = 0; i < size[0] / CELL; i++) {
        grid.push([]);
        for (let j = 0; j < size[1] / CELL; j++) {
            grid[i].push(0);
        }
    }

    grid[0][0] = 2; // start
    grid[0][1] = 3; // end

    return grid;
}

// Resize the canvas to the closest possible
// size values that are divisible by CELL
function resizeCanvas(canvas) {

    let canvGrid = document.getElementById("grid");

    width = canvGrid.offsetWidth;
    height = canvGrid.offsetHeight;

    canvas.width = width - width % CELL;
    canvas.height = height - height % CELL;

    return [canvas.height, canvas.width];
}

function render(grid, ctx, canvas) {

    ctx.lineWidth = 1;
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = GRAY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log(grid);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = BLACK;
                ctx.fillRect(j * CELL, i * CELL, CELL, CELL);
            }
            else {
                ctx.fillStyle = WHITE;
                ctx.strokeRect(j * CELL, i * CELL, CELL, CELL);
            }

            if (grid[i][j] > 1) {
                let start  = document.getElementById("start");
                let target = document.getElementById("target");
                ctx.drawImage(grid[i][j] == 2 ? start : target, j*CELL, i*CELL);
            }
        }
    }
}

function draw(grid, ctx, i, j) {

    if (grid[i][j] > 1) {
        return;
    }

    if (tool === 1) {
        grid[i][j] = 1;
        ctx.fillStyle = BLACK;
    }
    else if (tool === 0) {
        grid[i][j] = 0;
        ctx.fillStyle = WHITE;
    }
    ctx.fillRect(j * CELL, i * CELL, CELL, CELL);
    ctx.strokeRect(j * CELL, i * CELL, CELL, CELL);
}

function getMousePos(canvas, event, format='d') {

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



// Tool selection
function changeTool(toolBtn) {

    if (++tool > 1) {
        tool = 0;
    }

    toolBtn.innerText = "Tool: " + toolNames[tool];
}

// Clear grid