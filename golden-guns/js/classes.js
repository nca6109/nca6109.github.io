class Player extends PIXI.AnimatedSprite {
    constructor(name="player", deck, sheet, x, y){
        super(sheet);
        this.name = name;
        this.deck = deck;
        this.chamber = 0;
        this.action = null;
        this.isAlive = true;
        this.x = x;
        this.y = y;
        //TEMPORARY SHAPE TO REPRESENT PLAYER
        // this.beginFill(0xFFFFFF);
        // this.lineStyle(4, 0x000000, 1);
        // this.drawRect(0,0, 50, 100);
        // this.x = x;
        // this.y = y;
        // this.endFill();
    }

    //Functions
    attack(){
        if(this.chamber>0){
            // console.log("attack");
            //this.chamber = this.chamber-1;
            this.action = "attack";
        }
        else{
            console.log("Chamber is empty");
            this.action = null;
        }
    }
    dodge(){
        // console.log("dodge");
        this.action = "dodge";
    }
    reload(){
        if(this.chamber<6){
            // console.log("reload");
            //this.chamber = this.chamber+1;
            this.action = "reload";
        }
        else{
            console.log("Chamber is full");
            this.action = null;
        }
    }
    //Logic to determine which card will be returned
    useCard(card){
        if(card.type=="attack"){
            //don't need to check chamber if phantom bullet is used because no rounds are needed
            if(card.name=="Phantom Bullet"){
                this.action = "attack";
                return;
            }
            //
            if(this.chamber>0){
                this.action = "attack";
            }
            else{
                this.action=null;
            }
        }
        else if(card.type=="dodge"){
            //Can only use a reflect dodge if there is a round to use for it
            if(card.name=="Reflect Dodge"&&this.chamber>0){
                this.action="dodge";
            }
            else if(card.name=="Reflect Dodge"&&this.chamber<1){
                this.action=null;
            }
            else{this.action = "dodge";}
        }
        else if(card.type=="reload"){
            if(this.chamber<6){
                this.action="reload";
            }
            //Can only use double reload if there are at least two spots in the chamber left
            else if(this.chamber<5&&card.name=="Double Reload"){
                this.action="reload";
            }
            else{
                this.action=null;
            }
        }
    }
}

class Enemy extends Player {
    constructor(name="enemy", aiPattern=0, nextFighter=null, sheet, x, y){
        super(name, "", sheet, x, y);
        this.name = name;
        this.ai = aiPattern;
        this.chamber = 0;
        this.next = nextFighter
        //TEMPORARY SHAPE TO REPRESENT ENEMY
        // this.beginFill(0x000000);
        // this.lineStyle(4, 0xFFFFFF, 1);
        // this.drawRect(0,0, 50, 100);
        // this.x = x;
        // this.y = y;
        // this.endFill();
    }

    //decision function
    chooseAction(player){
        this.action = null;
        switch (this.ai) {
            case 0:
                //Default AI will make completely random decisions based on a 0-2 roll, only will perform valid actions
                while(this.action==null){
                    let randomNum = Math.floor(Math.random()*3);
                    if(randomNum==0 && this.chamber>0){this.attack(); this.chamber--;}
                    else if(randomNum==1 && player.chamber>0){this.dodge();}
                    else if(randomNum==2 && this.chamber<6){this.reload(); this.chamber++;}
                }
                break;
            case 1:
                //"Nervous" AI that won't do anything but reload until chamber is full then only attacks
                while(this.action==null){
                    if(this.chamber!=6){this.reload(); this.chamber++;}
                    else{this.attack(); this.chamber--;}
                }
                break;
            case 2:
                //"Aggressive" AI will shoot any time it has a round in the chamber, will dodge occasionally when empty
                while(this.action==null){
                    if(this.chamber>0){this.attack(); this.chamber--; continue;}
                    let randomNum = Math.floor(Math.random()*4);
                    if((randomNum>0&&this.chamber<6) || player.chamber==0){this.reload(); this.chamber++;}
                    else{this.dodge();}
                }
                break;
            case 3:
                //"Weasley" AI will dodge any time the player has rounds in the chamber
                while(this.action==null){
                    if(player.chamber>0){this.dodge(); continue;}
                    let randomNum = Math.floor(Math.random()*2);
                    if((randomNum>0&&this.chamber<6)||this.chamber==0){this.reload(); this.chamber++;}
                    else if(this.chamber>0){this.attack(); this.chamber--;}
                }
                break;
            case 4: 
                //Best AI that makes decisions more weighted by how the game has gone
                //THIS IS STILL THE DEFAUL AI, SMART AI NEEDS MORE THOUGHT
                while(this.action==null){
                    let randomNum = Math.floor(Math.random()*3);
                    if(randomNum==0 && this.chamber>0){this.attack(); this.chamber--;}
                    else if(randomNum==1 && player.chamber>0){this.dodge();}
                    else if(randomNum==2 && this.chamber<6){this.reload(); this.chamber++;}
                }
        }
    }
}

class Deck{
    constructor(cards=[], x, y){
        this.cards = cards;
        this.drawCards = [];
        for(let i=0; i<5; i++)
        {
            this.deckCardDraw(x+(i*3),y);
        }
    }

    deckCardDraw(cardX,cardY){
        this.drawCards.push(new Card("","","","",0xD3D3D3,cardX,cardY));
    }
}

class Card extends PIXI.Graphics{
    constructor(name="card", type=null, desc="Special Card", target=null, fill=0xD3D3D3, x, y){
        super();
        this.name = name;
        this.type = type;
        this.target = target;
        this.desc = desc;
        this.xInit = x;
        this.yInit = y;
        //TEMP RECTANGLES TO REPRESENT CARDS
        this.beginFill(fill);
        this.lineStyle(2, 0x000000, 1);
        this.drawRoundedRect(0,0, 120, 150,20);
        this.x = x;
        this.y = y;
        this.endFill();
    }
}