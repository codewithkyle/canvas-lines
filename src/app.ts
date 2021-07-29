const canvas = document.body.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const LINE_COLOUR = "#9CA3AF";
const LINE_HOVER_COLOUR = "#EC4899";

let openStartPoint:Point = null;
let mousePos:Point = null;

type Point = {
    x:number,
    y:number,
}

class Line {
    public start: Point;
    public end: Point;
    public uid: string;
    
    constructor(start:Point, end:Point){
        this.start = start;
        this.end = end;
        this.uid = uuid();
    }
}

const lines:Array<Line> = [];
let highlightedLines:Array<string> = [];

function drawLine(startX, startY, endX, endY){
    const centerX = (startX + endX) / 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (Math.abs(startY - endY) >= 16 && Math.abs(startX - endX) >= 16){
        const offsetY = endY >= startY ? -8 : 8;
        const offsetX = endX <= startX ? 8 : -8;
        ctx.lineTo((centerX + offsetX), startY);
        ctx.arcTo(centerX, startY, centerX, (startY + offsetY * -1), 8);
        ctx.lineTo(centerX, (endY + offsetY));
        ctx.arcTo(centerX, endY, (centerX + offsetX * -1), endY, 8);
        ctx.lineTo(endX, endY);
    } else {
        ctx.lineTo(centerX, startY);
        ctx.lineTo(centerX, endY);
        ctx.lineTo(endX, endY);
    }
    ctx.stroke();
}

let oldTime = performance.now();
function eventLoop() {
    const newTime = performance.now();
    const deltaTime = (newTime - oldTime) / 1000;
    oldTime = newTime;
    highlightedLines = [];
    
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (openStartPoint !== null){
        ctx.strokeStyle = LINE_COLOUR;
        const { x: startX, y: startY } = openStartPoint;
        const { x: endX, y: endY } = mousePos;
        drawLine(startX, startY, endX, endY);   
    }

    for (let i = 0; i < lines.length; i++){
        const { x: mouseX, y: mouseY } = mousePos;
        const { x: startX, y: startY } = lines[i].start;
        const { x: endX, y: endY } = lines[i].end;
        const aX = startX <= endX ? startX : endX;
        const aY = startY <= endY ? startY : endY;
        const bX = startX >= endX ? startX : endX;
        const bY = startY >= endY ? startY : endY;
        if (
            mouseX >= aX && mouseX <= bX &&
            mouseY >= aY && mouseY <= bY
        ) {
            const centerX = (startX + endX) / 2;
            const direction = startX <= endX ? -1 : 1;
            if (mouseX >= centerX - 8 && mouseX <= centerX + 8){
                highlightedLines.push(lines[i].uid);
            }
            else if (mouseY >= startY - 8 && mouseY <= startY + 8){
                if (direction === -1){
                    if (mouseX <= centerX){
                        highlightedLines.push(lines[i].uid);
                    }
                } else {
                    if (mouseX >= centerX){
                        highlightedLines.push(lines[i].uid);
                    }
                }
            }
            else if (mouseY >= endY - 8 && mouseY <= endY + 8){
                if (direction === -1){
                    if (mouseX >= centerX){
                        highlightedLines.push(lines[i].uid);
                    }
                } else {
                    if (mouseX <= centerX){
                        highlightedLines.push(lines[i].uid);
                    }
                }
            }
        }
    }
    
    for (let i = 0; i < lines.length; i++){
        const line:Line = lines[i];
        const { x: startX, y: startY } = line.start;
        const { x: endX, y: endY } = line.end;
        if (highlightedLines.includes(line.uid)){
            ctx.strokeStyle = LINE_HOVER_COLOUR;
        } else {
            ctx.strokeStyle = LINE_COLOUR;
        }
        drawLine(startX, startY, endX, endY);
    }
    window.requestAnimationFrame(eventLoop);
}
eventLoop();

canvas.addEventListener("mousemove", (e:MouseEvent) => {
    mousePos = {
        x: e.clientX,
        y: e.clientY,
    };
}, { capture: true });

canvas.addEventListener("mousedown", (e:MouseEvent) => {
    openStartPoint = {
        x: e.clientX,
        y: e.clientY
    };
});

canvas.addEventListener("mouseup", (e:MouseEvent) => {
    const line = new Line(openStartPoint, {
        x: e.clientX,
        y: e.clientY
    });
    lines.push(line);
    openStartPoint = null;
}, { capture: true });

function uuid() {
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }