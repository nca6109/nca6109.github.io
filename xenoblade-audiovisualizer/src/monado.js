//Helper method to draw monado to canvas, stored in separate file to save space
const drawMonado = (ctx, height) => {
    //Draw ether exhaust
    for(let i=0;i<4;i++)
    {
        ctx.save()
        ctx.fillStyle = "#797979";
        ctx.strokeStyle = "black";
        ctx.translate(150+i*50,85);
        ctx.rotate(-Math.PI/4);
        ctx.fillRect(0,0,20,50);
        ctx.strokeRect(0,0,20,50);
        ctx.restore();
    }
    //Draw top bar
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#3e1216";
    ctx.lineWidth=30;
    ctx.moveTo(93,150);
    ctx.lineTo(140,130);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#9b3039";
    ctx.lineWidth = 15;
    ctx.moveTo(0,70);
    ctx.quadraticCurveTo(80,60, 130, 110);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineJoin = "round";
    ctx.moveTo(122,105);
    ctx.lineTo(380,105);
    ctx.arcTo(400, 105, 400, 120, 20);
    ctx.lineTo(400,155);
    ctx.lineTo(145,155);
    ctx.quadraticCurveTo(140, 120, 122,113);
    ctx.fill();
    ctx.closePath();
    ctx.moveTo(400,120);
    ctx.lineTo(400,155);
    ctx.lineTo(630,155);
    ctx.quadraticCurveTo(660,135,650,120);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    //Draw bottom bar
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#3e1216";
    ctx.lineWidth = 30;
    ctx.moveTo(85,265);
    ctx.lineTo(100, 320);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    ctx.save();
    ctx.translate(0,-10);
    ctx.beginPath();
    ctx.fillStyle = "#9b3039";
    ctx.moveTo(0,325);
    ctx.lineTo(450,325);
    ctx.arcTo(540, 305, 550, 298, 300);
    ctx.lineTo(650, 270);
    ctx.arcTo(650, 345, 300, 445, 100);
    ctx.lineTo(40,370);
    ctx.quadraticCurveTo(20, 370,0,390);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    //Draw arts window
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#9b3039";
    ctx.arc(20,height/2,100, 0, 2*Math.PI,false);
    ctx.arc(20,height/2,80, 0, 2*Math.PI,true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    //Draw ether lines
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,255,1)";
    ctx.lineWidth=3;
    ctx.moveTo(0,335);
    ctx.lineTo(450,335);
    ctx.quadraticCurveTo(600, 320, 620, 260);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(137,130);
    ctx.lineTo(205,130);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(20,height/2, 90, 0,2*Math.PI,false);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

export {drawMonado};