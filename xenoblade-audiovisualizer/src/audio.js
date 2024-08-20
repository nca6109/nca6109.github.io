let audioCtx;

let element, sourceNode, analyserNode, gainNode, highBiquadFilter, lowBiquadFilter;

const DEFAULTS = Object.freeze({
    gain       :      .5,
    numSamples :     256
});  

// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);

const setupWebaudio = (filePath) =>{
    //The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitaudioContext;
    audioCtx = new AudioContext();

    element = new Audio(); //document.querySelector("audio")

    //point at a sound file
    loadSoundFile(filePath);

    //create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    //Create biquad filters
    highBiquadFilter = audioCtx.createBiquadFilter();
    highBiquadFilter.type = "highshelf";
    lowBiquadFilter = audioCtx.createBiquadFilter();
    lowBiquadFilter.type = "lowshelf";
    //create an analyser node
    analyserNode = audioCtx.createAnalyser();

    analyserNode.fftSize = DEFAULTS.numSamples;

    //create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    //connect the nodes - we now have an audio graph
    sourceNode.connect(highBiquadFilter);
    highBiquadFilter.connect(lowBiquadFilter);
    lowBiquadFilter.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

const loadSoundFile = (filePath) =>{
    element.src = filePath;
}

const playCurrentSound = () =>{
    element.play();
}

const pauseCurrentSound = () =>{
    element.pause();
}

const setVolume = (value) =>{
    value = Number(value) // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

const boostFreq = (params = {}) =>
{
    if(params.trebleBeam){
        highBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); 
        highBiquadFilter.gain.setValueAtTime(10, audioCtx.currentTime);
    }
    else{
        highBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
    if(params.bassBeam){
        lowBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        lowBiquadFilter.gain.setValueAtTime(5, audioCtx.currentTime);
    }
    else{
        lowBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const autoplayCheck = (drawParams) => {
    if(audioCtx.state=="suspended") {
        audioCtx.resume();
        drawParams.paused = false;
        drawParams.showSymbol=true;
      }
}

export {autoplayCheck,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume, boostFreq,analyserNode};