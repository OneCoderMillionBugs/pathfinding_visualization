const CELL = 40;

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const GRAY  = "#808080";

// Current drawing tool
// 0 - eraser, 1 - wall
let tool = 1;
const toolNames = ["Eraser", "Wall"];



function main() {
    
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let grid = clearCanvas(canvas);

    render(grid, ctx, canvas);
    
    let drawing = false;

    // Set up clean canvas on resizing browser window
    window.addEventListener("resize", function(event) {

        grid = clearCanvas(canvas);
        render(grid, ctx, canvas);
    });

    canvas.addEventListener("mousedown", function(event) {

        drawing = true;
        draw(grid, ctx, canvas, event);
    });

    canvas.addEventListener("mouseup", function(event) {

        drawing = false;
    });

    canvas.addEventListener("mousemove", function(event) {

        if (drawing === true) {
            draw(grid, ctx, canvas, event);
        }
    });
}

// Return new grid with all values set to 0
function clearCanvas(canvas) {

    let size = resizeCanvas(canvas); // height, width
    grid = [];

    for (let i = 0; i < size[0] / CELL; i++) {
        grid.push([]);
        for (let j = 0; j < size[1] / CELL; j++) {
            grid[i].push(0);
        }
    }

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

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 0) {
                ctx.strokeRect(j * CELL, i * CELL, CELL, CELL);
            }
            else if (grid[i][j] === 1) {
                ctx.fillStyle = BLACK;
                ctx.fillRect(j * CELL, i * CELL, CELL, CELL);
            }
        }
    }
}

function draw(grid, ctx, canvas, event) {

    let rect = canvas.getBoundingClientRect();
    let j = parseInt((event.clientX - rect.left) / CELL);
    let i = parseInt((event.clientY - rect.top) / CELL);

    if (grid[i][j] > 1) {
        // call drag-n-drop function
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



// Tool selection
function changeTool(toolBtn) {

    if (++tool > 1) {
        tool = 0;
    }

    toolBtn.innerText = "Tool: " + toolNames[tool];
}

// Clear grid