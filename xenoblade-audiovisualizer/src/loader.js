import * as main from "./main.js";
import { ArtSprite } from "./artSprite.js";

const imgs = [];
const sprites = [];
let spritesLoaded = 0;
window.onload = ()=>{
	// 1 - do preload here - load fonts, images, additional sounds, etc...
	loadSpritesXHR();

	
	// 2 - start up app
	//main.init(sprites);
}


let loadSpritesXHR = () => {
	const url = "./data/av-data.json";
	const xhr = new XMLHttpRequest();
	xhr.onload = (e) => {
		console.log(`In onload - HTTP Status Code = ${e.target.status}`);
		const text = e.target.responseText;
		const json = JSON.parse(text);
		let title = json.title;
		let tracks = json.tracks;
		let songValues = document.querySelectorAll("#song");
		//Assign title with value from JSON object
		document.querySelector("title").innerHTML = title;
		document.querySelector("h1").innerHTML = title;
		//Assign each song selector with a music track
		for(let i=0;i<songValues.length;i++)
		{
			songValues[i].value=tracks[i].source;
			songValues[i].innerHTML=tracks[i].name;
		}
		//Print instructions under corresponding tag
		document.querySelector("#instructions").innerHTML=json.instructions;
		//Begin img preloading process
		for(let i of json.imgs){
			imgs.push(i);
		}
		for(let img of imgs){
			preloadImage(img, createArtSprite);
		}
	};
	xhr.onerror = e => console.log(`In onerror - HTTP Status Code = ${e.target.status}`);
	xhr.open("GET", url);
	xhr.send();
}

let preloadImage = (loadObj,callback) => {
	// 1 - create a new Image object
	let img = new Image();
	
	// 2 - set up event handlers for the Image object
	img.onload = () => {
	  // 4 - when the image shows up, call createArtSprite
	  spritesLoaded++;
	  callback(img,loadObj.name, loadObj.color,loadObj.red,loadObj.green,loadObj.blue);
	  if(spritesLoaded==8)
	  {
		main.init(sprites);
	  }
	};

	img.onerror = _=>{
	  // 4B - called if there is an error
	  console.log(`Image at url "${url}" wouldn't load! Check your URL!`);
	};

	img.src = loadObj.url;
}

let createArtSprite = (img,name,color,red,green,blue) => {
	sprites.push(new ArtSprite(img, name, color,red,green,blue));
}