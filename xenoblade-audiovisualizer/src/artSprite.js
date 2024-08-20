import * as utils from './utils.js';

class ArtSprite{
    static type = "arc";
    constructor(img, name, color, red, green, blue){
      this.img = img;
      this.name = name;
      //Color as string for organizing
      this.color=color;
      //Save colors individually for manipulation later
      this.red=red;
      this.blue=blue;
      this.green=green;
      this.intermediate = this.halfWhite();
      this.x = -20;
      //Greater than default canvas size
      this.y = 1000;
      this.rotation = 0;
    }

    update(ctx, h, audioData){
        let soundRot=0;
        //for(let data of audioDataW){soundRot+=data;}
        //soundRot = (soundRot/audioDataW.length-20)/100;
        for(let i=60;i<75;i++){
            soundRot+=audioData[i];
        }
        soundRot = (soundRot/15)/100;
        if(soundRot<0.5){soundRot=0.5;}
        if(this.y>h+50){return;}
        ctx.save();
        this.draw(ctx, this.x, this.y+1.5, this.rotation+0.01, soundRot);
        ctx.restore();
    }
    
    draw(ctx, x, y, theta, scale){
        ctx.save()
        ctx.translate(x,y);
        ctx.scale(scale,scale);
        this.x =x;
        this.y=y;
        ctx.rotate(theta);
        this.rotation = theta;
        let aura;
        if(this.color=="rgba(255,255,255,0)"){
            aura = utils.getRadialGradient(ctx,0,0,25, 0,0,50,
                [{percent:0, color:'#000'},{percent:1, color:this.color}]);
        }
        else{
        aura = utils.getRadialGradient(ctx,0,0,25, 0,0,50,
            [{percent:0, color:'#fff'},{percent:1, color:this.color}]);
        }
        ctx.beginPath();
        ctx.fillStyle = aura;
        ctx.arc(0,0,50,0,2*Math.PI,false);
        ctx.fill();
        ctx.closePath();
        ctx.drawImage(this.img,-25,-25,50,50);
        ctx.restore();
    }

    halfWhite(){
        let r = (255+this.red)/2;
        let g = (255+this.green)/2;
        let b = (255+this.blue)/2;
        if(this.red==255&&this.blue==255&this.green==255)
        {
            let half = 255/2;
            r=half;
            g=half;
            b=half;
        }
        return `rgba(${r},${g},${b},0.15)`;
    }
    
}

  export {ArtSprite};