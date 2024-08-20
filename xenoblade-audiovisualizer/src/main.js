import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './visualizer.js';

const drawParams = {
  paused       : true,
  showGradient : true,
  showSBeam    : true,
  showEBeam    : true,
  showCircles  : true,
  showInvert   : false,
  showEmboss   : false,
  trebleBeam   : false,
  bassBeam     : false,
  showSymbol   : false
};

const DEFAULTS = Object.freeze({
	sound1  :  "media/audio/You Will Know Our Names.mp3"
});

const setupUI = (canvasElement) =>{
  const playButton = document.querySelector("#btn-play");
  const gradientBox = document.querySelector("#cb-gradient");
  const sBeamBox = document.querySelector("#cb-sbeam");
  const eBeamBox = document.querySelector("#cb-ebeam");
  const circlesBox = document.querySelector("#cb-circles");
  const invertBox = document.querySelector("#cb-invert");
  const embossBox = document.querySelector("#cb-emboss");
  const normRad = document.querySelector("#normal");
  const trebRad = document.querySelector("#treble");
  const bassRad = document.querySelector("#bass");
	
  playButton.onclick = e => {
    // check if context is in suspended state (autoplay policy)
    audio.autoplayCheck(drawParams);
    if(e.target.dataset.playing == "no"){
      audio.playCurrentSound();
      drawParams.paused = false;
      drawParams.showSymbol=true;
      e.target.dataset.playing = "yes";
    }else{
      audio.pauseCurrentSound();
      drawParams.paused = true;
      drawParams.showSymbol=false;
      e.target.dataset.playing = "no";
    }
  };

  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#label-volume");

  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update the value of the label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value/2*100));
  };

  //set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  //hookup track <select>
  let trackSelect = document.querySelector("#track-select");
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    //pause the current track if it is playing
    if (playButton.dataset.playing == "yes"){
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };
	
  //Add event handlers to each checkbox
  gradientBox.onchange = e =>{
    drawParams.showGradient=e.target.checked;
  }
  sBeamBox.onchange = e =>{
    drawParams.showSBeam = e.target.checked;
  }
  eBeamBox.onchange = e =>{
    drawParams.showEBeam = e.target.checked;
  }
  circlesBox.onchange = e =>{
    drawParams.showCircles = e.target.checked;
  }
  invertBox.onchange = e =>{
    drawParams.showInvert = e.target.checked;
  }
  embossBox.onchange = e =>{
    drawParams.showEmboss = e.target.checked;
  }
  normRad.onchange = e =>{
    drawParams.trebleBeam = false;
    drawParams.bassBeam = false;
    audio.boostFreq(drawParams);
  }
  trebRad.onchange = e =>{
    drawParams.trebleBeam = e.target.checked;
    drawParams.bassBeam = false;
    audio.boostFreq(drawParams);
  }
  bassRad.onchange = e =>{
    drawParams.bassBeam = e.target.checked;
    drawParams.trebleBeam = false;
    audio.boostFreq(drawParams);
  }

  //Add click event handler to canvas
  canvasElement.onclick = e => {
    let mousePos = getMousePos(canvasElement,e);
    canvas.drawArt(mousePos.x, mousePos.y);
  }

}

const loop = () =>{
    setTimeout(loop,1000/60);
    canvas.draw(drawParams);
  }

const init = (sprites) =>{
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
    audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement,audio.analyserNode, sprites);
  loop();
}

const getMousePos = (canvas, evt) => {
  let rect = canvas.getBoundingClientRect();
  return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
  };
}

export {init};