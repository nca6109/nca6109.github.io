/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import {ArtSprite} from './artSprite.js';
import { drawMonado } from './monado.js';

let ctx,canvasWidth,canvasHeight,gradient,windowGradient,analyserNode,audioData,audioDataW,arts,takeWave,windowArt,scaleFactor,shrinking,beamColor;


const setupCanvas = (canvasElement,analyserNodeRef, sprites) =>{
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0, color: `rgb(135,206,235)`},{percent:.5,color:"rgb(255,255,255)"},{percent:1,color:"#5FC314"}]);
    // keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
    audioDataW = new Uint8Array(analyserNode.fftSize);
    //first sprite will be used for any coloring that is symbol dependent
    windowGradient = utils.getRadialGradient(ctx,20,canvasHeight/2,15, 20,canvasHeight/2,100,
    [{percent:0, color:'rgba(255,255,255,0.1)'},{percent:.5, color:sprites[0].intermediate},{percent:1, color:sprites[0].color}]);
    arts = sprites;
    takeWave=0;
    windowArt = sprites[0].img;
    scaleFactor=0;
    shrinking=false;
    beamColor = `rgba(${sprites[0].red},${sprites[0].green},${sprites[0].blue},0.75)`;
}

const draw = (params={}) =>{
  // 1 - populate the audioData array with the frequency data from the analyserNode
	analyserNode.getByteFrequencyData(audioData); //frequency data
	analyserNode.getByteTimeDomainData(audioDataW); // waveform data
	
	// 2 - draw background
	ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
		
	// draw gradient
	if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth, canvasHeight);
        ctx.restore();
    }

    // draw sword beams
    takeWave++;
    //When music is playing, restrict beam update to 20 fps because waveform data changes too fast
    if(params.showSBeam&&params.paused){drawSBeam(params);}
	else if(params.showSBeam&&takeWave%3==0){drawSBeam(params);}

    //Draw exhaust beams
    if(params.showEBeam)
    {
        let bassValues=[];
        let tenorValues=[];
        let altoValues=[];
        let sopValues=[];
        for(let i=0; i<audioData.length-1; i++)
        {
            if(i<25)
            {
                bassValues.push(audioData[i]);
            }
            else if(i<50)
            {
                tenorValues.push(audioData[i]);
            }
            else if(i<75)
            {
                altoValues.push(audioData[i]);
            }
            else
            {
                sopValues.push(audioData[i]);
            }
        }
        let bassHeight, tenorHeight, altoHeight, sopHeight;
        bassHeight=freqAvg(bassValues);
        tenorHeight=freqAvg(tenorValues);
        altoHeight=freqAvg(altoValues);
        sopHeight=freqAvg(sopValues);
        let heights = [bassHeight,tenorHeight,altoHeight,sopHeight];
        for(let i=0;i<4;i++)
        {
            ctx.save()
            ctx.fillStyle = beamColor;
            ctx.strokeStyle = "rgba(255,255,255,.5)"
            ctx.translate(150+i*50,85);
            ctx.rotate(-Math.PI/4);
            ctx.fillRect(2,0,16,-heights[i]/3);
            ctx.strokeRect(2,0,16,-heights[i]/3);
            ctx.restore();
        }
    }

    //Draw monado
    drawMonado(ctx, canvasHeight);

	// 5 - draw art window
    //Clear window background
    ctx.save();
    if(params.showGradient){ctx.fillStyle = gradient;}
    else{ctx.fillStyle="black";}
    ctx.beginPath();
    ctx.arc(20,canvasHeight/2, 80,0,2*Math.PI,false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

	if(params.showCircles){
        let maxRadius = canvasHeight/5;
        ctx.save();
        ctx.globalAlpha = 0.5;
        for(let i=0; i<audioData.length; i++){
            //red-ish circles
            let percent = audioData[i] /255;
            let circleRadius = percent * maxRadius;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = windowGradient;
            ctx.arc(20, canvasHeight/2, circleRadius*1.2, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        ctx.restore();
        //Update the art window symbol
        if(params.showSymbol){
            if(shrinking){scaleFactor-=0.005;}
            else{scaleFactor+=0.005;}
            if(scaleFactor>1){shrinking=true;}
            else if(scaleFactor<0.65){shrinking=false;}
            ctx.save();
            ctx.translate(20,canvasHeight/2);
            ctx.scale(scaleFactor,scaleFactor);
            ctx.globalAlpha=0.75;
            ctx.drawImage(windowArt, -50, -50,100,100);
            ctx.restore();
        }
    }

    //Update the translation and rotation of falling art bubbles   
    for(let a of arts)
    {
        a.update(ctx, canvasHeight, audioData);
    }

    // 6 - bitmap manipulation
	let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; //not using here
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0; i < length; i += 4){
        if(params.showInvert){
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255-red;     //set red
            data[i+1] = 255-green; //set green
            data[i+2] = 255-blue;  //set blue
            //data[i+3] is the alpha which is being left alone   
        }
	}
    //Embossing
    if(params.showEmboss){
        for(let i=0; i<length; i++){
            if(i%4==3)continue; //skip alpha channel
            data[i] = 127 + 2*data[i] - data[i+4] - data[i+width *4];
        }
    }

	// D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);

}

//Reset gradient to initial look
const resetGradient = () => {gradient=utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0, color: `rgb(135,206,235)`},{percent:.5,color:"white"},{percent:1,color:"#5FC314"}]);}

//Draws an art symbol at location where mouse was clicked
const drawArt = (x,y) => {
    let notAvailable=true;
    let numChecked = 0;
    let chosenArt;
    //Loop prevents already shown sprites from being called again
    while(notAvailable){
        chosenArt = arts[Math.floor(Math.random()*arts.length)];
        if(chosenArt.y>canvasHeight+25||numChecked>=arts.length)
        {
            notAvailable=false;
        }
        numChecked++;
    }
    chosenArt.x=x;
    chosenArt.y=y;
    windowArt=chosenArt.img;
    beamColor=`rgba(${chosenArt.red},${chosenArt.green},${chosenArt.blue},0.75)`;
    changeGradient(chosenArt);
}

//Changes the gradient to match the art that was chosen on click
const changeGradient = (art) => {
    windowGradient = utils.getRadialGradient(ctx,20,canvasHeight/2,15, 20,canvasHeight/2,100,
    [{percent:0, color:'rgba(255,255,255,0.1)'},{percent:.5, color:art.intermediate},{percent:1, color:art.color}]);
}

//Helper function to determine exhaust beam heights
const freqAvg = (values) => {
    let sum = 0;
    for(let i=0;i<values.length;i++)
    {
        sum+=values[i];
    }
    return sum/values.length;
}

const drawSBeam = (params={}) =>{
    let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioDataW.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioDataW.length;
        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,0.50)`;
        ctx.strokeStyle = beamColor;
        if(params.trebleBeam){ctx.lineWidth = 5;}
        else if(params.bassBeam){ctx.lineWidth = 20;}
        else{ctx.lineWidth = 10;}
        //loop through data and draw
        for(let i=0; i<audioDataW.length-1; i++){
            //ctx.fillRect(margin+i*(barWidth+barSpacing),topSpacing+128-audioDataW[i], barWidth, barHeight);
            //ctx.strokeRect(margin+i*(barWidth+barSpacing),topSpacing+128-audioDataW[i], barWidth, barHeight);
            ctx.beginPath();
            ctx.moveTo(margin+i*(barWidth+barSpacing),canvasHeight*.7-audioDataW[i]/2);
            ctx.lineTo(margin+(i+1)*(barWidth+barSpacing),canvasHeight*.7-audioDataW[i+1]/2);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
}

export {setupCanvas,draw, drawArt, resetGradient};