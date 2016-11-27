/**
 * Created by WeiRuifeng on 2016/11/27.
 */

var canvas = document.getElementById("canvas"),
    context = canvas.getContext('2d'),
    eraseAllButton = document.getElementById("eraseAllButton"),
    strokeStyleSelect = document.getElementById("strokeStyleSelect"),
    fillStyleSelect = document.getElementById("fliiStyleSelect"),
    strokeShapeSelect = document.getElementById("strokeShapeSelect"),
    StrokeWidthSelect = document.getElementById("StrokeWidthSelect"),
    guidewireCheckbox = document.getElementById("guidewireCheckbox"),
    fillCheckBox =  document.getElementById("fillCheckBox"),
    drawingSurfaceImageData,
    mousedown = {},
    rubberbandRect = {},
    dragging = false,
    guidewires = guidewireCheckbox.checked;

var roundRectRadius = 20;

function drawGrid(color,stepx,stepy){
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 0.5;
    var i;
    for(i = stepx + 0.5; i<context.canvas.width; i += stepx){
        context.beginPath();
        context.moveTo(i,0);
        context.lineTo(i,context.canvas.height);
        context.stroke();
    }
    for(i = stepy + 0.5;i<context.canvas.height; i += stepy){
        context.beginPath();
        context.moveTo(0,i);
        context.lineTo(context.canvas.width,i);
        context.stroke();
    }
    context.restore();
}

function windowToCanvas(x,y){
    var bbox = canvas.getBoundingClientRect();
    return {
        x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height)
    };
}

function saveDrawingSurface(){
    // getImageData() 复制画布上指定矩形的像素数据
    drawingSurfaceImageData = context.getImageData(0,0,canvas.width,canvas.height);
}
function restoreDrawingSurface(){
    // 通过 putImageData() 将图像数据放回画布
    context.putImageData(drawingSurfaceImageData,0,0);
}

function updateRubberbandRectangle(loc){
    rubberbandRect.width = Math.abs(loc.x - mousedown.x);
    rubberbandRect.height = Math.abs(loc.y - mousedown.y);

    if(loc.x > mousedown.x){
        rubberbandRect.left = mousedown.x;
    }else{
        rubberbandRect.left = loc.x;
    }
    if(loc.y > mousedown.y){
        rubberbandRect.top = mousedown.y;
    }else{
        rubberbandRect.top = loc.y;
    }
}
function updateRubberband(loc){
    updateRubberbandRectangle(loc);
    switch (strokeShapeSelect.value){
        case "line":
            drawRubberbandShapeLine(loc);
            break;
        case "circle":
            drawRubberbandShapeCircle2(loc);
            break;
        case "rect":
            drawRubberbandShapeRect(loc);
            break;
        case "arcrect":
            drawRubberbandShapeArcrect(loc);
            break;
        default :
            break;
    }
}

function drawRubberbandShapeLine(loc){
    context.beginPath();
    context.moveTo(mousedown.x,mousedown.y);
    context.lineTo(loc.x,loc.y);
    context.stroke();
}
// mousedown为圆心
function drawRubberbandShapeCircle(loc){
    var angle,
        radius;
    if(mousedown.y === loc.y){
        radius = Math.abs(loc.x - mousedown.x);
    }else{
        angle = Math.atan(rubberbandRect.height/rubberbandRect.width);
        radius = rubberbandRect.height / Math.sin(angle);
    }
    context.beginPath();
    context.arc(mousedown.x,mousedown.y,radius,0,Math.PI*2,false);
    context.stroke();

    if(fillCheckBox.checked){
        context.fill();
    }
}
// mousedown不为圆心
function drawRubberbandShapeCircle2(loc){
    var angle,
        radius;
    if(mousedown.y === loc.y){
        radius = Math.abs(loc.x - mousedown.x)/2;
    }else{
        angle = Math.atan(rubberbandRect.height/rubberbandRect.width);
        radius = rubberbandRect.height / Math.sin(angle)/2;
    }
    context.beginPath();
    context.arc((mousedown.x + loc.x)/2,(mousedown.y + loc.y)/2,radius,0,Math.PI*2,false);
    context.stroke();

    if(fillCheckBox.checked){
        context.fill();
    }
}
function drawRubberbandShapeRect(loc){
    context.beginPath();
    context.rect(rubberbandRect.left,rubberbandRect.top,rubberbandRect.width,rubberbandRect.height);
    context.stroke();

    if(fillCheckBox.checked){
        context.fill();
    }
}
function drawRubberbandShapeArcrect(loc){
    if(rubberbandRect.width/2 < roundRectRadius || rubberbandRect.height/2 < roundRectRadius ){
        drawRubberbandShapeRect(loc);
    }else{
        context.beginPath();
        context.moveTo(rubberbandRect.left + roundRectRadius,rubberbandRect.top);

        context.arcTo(rubberbandRect.left + rubberbandRect.width,
            rubberbandRect.top,
            rubberbandRect.left + rubberbandRect.width,
            rubberbandRect.top + rubberbandRect.height
            ,roundRectRadius);
        context.arcTo(rubberbandRect.left + rubberbandRect.width,
            rubberbandRect.top + rubberbandRect.height,
            rubberbandRect.left,
            rubberbandRect.top + rubberbandRect.height,
            roundRectRadius);
        context.arcTo( rubberbandRect.left,
            rubberbandRect.top + rubberbandRect.height,
            rubberbandRect.left,
            rubberbandRect.top,
            roundRectRadius);
        context.arcTo( rubberbandRect.left,
            rubberbandRect.top,
            rubberbandRect.left + roundRectRadius,
            rubberbandRect.top,
            roundRectRadius);
        context.stroke();
        if(fillCheckBox.checked){
            context.fill();
        }
    }
}

function drawHorizatalLine(y){
    context.beginPath();
    context.moveTo(0,y+0.5);
    context.lineTo(context.canvas.width,y+0.5);
    context.stroke();
}
function drawVerticalLine (x) {
    context.beginPath();
    context.moveTo(x+0.5,0);
    context.lineTo(x+0.5,context.canvas.height);
    context.stroke();
}
function drawGuidewires(x,y){
    context.save();
    context.strokeStyle = 'rgba(0,0,230,0.5)';
    context.lineWidth = 0.5;
    drawVerticalLine(x);
    drawHorizatalLine(y);
    context.restore();
}

canvas.onmousedown = function(e){
    var loc = windowToCanvas(e.clientX, e.clientY);

    e.preventDefault();
    saveDrawingSurface();
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    dragging = true;
};
canvas.onmousemove = function (e) {
    var loc;
    if(dragging){
        e.preventDefault();
        loc = windowToCanvas(e.clientX, e.clientY);
        restoreDrawingSurface();
        updateRubberband(loc);
        if(guidewires){
            drawGuidewires(loc.x,loc.y);
        }
    }
};
canvas.onmouseup = function(e){
    loc = windowToCanvas(e.clientX, e.clientY);
    restoreDrawingSurface();
    updateRubberband(loc);
    dragging = false;
};

eraseAllButton.onclick = function(e){
    context.clearRect(0,0,canvas.width,canvas.height);
    drawGrid('lightgray',10,10);
    saveDrawingSurface();
    context.strokeStyle = strokeStyleSelect.value;
    context.fillStyle = fillStyleSelect.value;
};
strokeStyleSelect.onchange = function(e){
    context.strokeStyle = strokeStyleSelect.value;
};
fillStyleSelect.onchange = function(e){
    context.fillStyle = fillStyleSelect.value;
};
StrokeWidthSelect.onchange = function(e){
    context.lineWidth = StrokeWidthSelect.value;
};
guidewireCheckbox.onchange = function(e){
    guidewires = guidewireCheckbox.checked;
};

//Inintialzation
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;
context.lineWidth = StrokeWidthSelect.value;
drawGrid('lightgray',10,10);