"use strict";
const app = new PIXI.Application({
    width: 1010,
    height: 600,
    backgroundColor: 0x2980B9
});
document.querySelector("#game").appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

//Local storage variables
const prefix = "nca6109-";
const namesSearchKey = prefix+"playerNames";
const decksSearchKey = prefix+"playerDecks";

let storedNames;
let storedDecks;

//Action enum
const results = {
    AA: "attck/attack",
    AD: "attack/dodge",
    AR: "attack/reload",
    DA: "dodge/attack",
    DD: "dodge/dodge",
    DR: "dodge/reload",
    RA: "reload/attack",
    RD: "reload/dodge",
    RR: "reload/reload",
    REFLECT: "reflect",
    TRACKED: "tracked",
}
let resultCombo;

//game loop enum
const modes = {
    TITLE: "title",
    PLAYERTURN: "playerTurn",
    ENEMYTURN: "enemyTurn",
    PLAYACTION: "playAction",
    DISPLAYRESULT: "displayResult",
    GAMEOVER: "gameOver",
}
let mode = modes.TITLE;

//aliases
let stage;

//game variables
let startScene;
let howToWindow, gameplay, howButtons, howCards, cardEx, closeB, closeL;
let gameScene, player, enemy, deck, chamberIcon, playerNameL, enemyNameL, roundL, handL;
let displayScene, popup, resultsLabel, nextTurn, goGameOver, nextFighter;
let endTurnL, endTurnB, attackB, reloadB, dodgeB, attackL, reloadL, dodgeL, chamberL, covers;
let cardPop, cardDesc;
let buttonLabels;
let gameOverScene, gameOverLabel;

//sprite variables
let playerSheet = {};
let enemySheet = {};
let playerAnimPart=0;
let enemyAnimPart=0;
let enemyAnimFunction=0;
let playerAnimFunction=0;

//Sound variables
let click;
let gunClick;
let gunShot;
let ricochet;

//Non-scene variables
let playerAction;
let enemyAction;
let playerName
let result;
let round;
let cardPlayed;
let movedCard;
let hand1, hand1X, hand1Y;
let hand2, hand2X, hand2Y;
const bullets=[];
const discardPile=[];

// //Add controls for the enter name button
function enterButtonControl(){
    let enterButton = document.querySelector("#enter");
    enterButton.addEventListener("click", storeName);
}
//Sends name to local storage and fills the name variable
function storeName(){
    let typedName = document.querySelector("#name").value.toLowerCase();
    //make sure name isn't already in local storage, if isn't don't send to storage
    let exists;
    for(let person of storedNames)
    {
        if(person==typedName){exists=true;}
    }
    if(!exists){
        storedNames.push(typedName);
        let jsonNames;
        jsonNames = JSON.stringify(storedNames);
        localStorage.setItem(namesSearchKey, jsonNames);
    }
    //assign playerName as typed name
    playerName=typedName
    player.name = playerName.charAt(0).toUpperCase() + playerName.slice(1);
    //If you have beaten golden gun gary, you are the golden gun duelist
    for(let obj of storedDecks)
    {
        if(obj.name==playerName&&obj.deck.length==5){
            player.name=`Golden Gun ${player.name}`;
        }
    }
    playerNameL.text = player.name;
}
//function to put decks into local storage
function storeDecks(){
    let jsonDecks;
    jsonDecks = JSON.stringify(storedDecks);
    localStorage.setItem(decksSearchKey, jsonDecks);
}
function saveDeck(){
    //if player already has a deck in local storage, remove it.
    for(let obj of storedDecks)
    {
        if(obj.name.toLowerCase()==playerName.toLowerCase()){
            storedDecks.splice(storedDecks.indexOf(obj), 1);
        }
    }
    let fullDeck=[];
    if(hand1){fullDeck.push(hand1.name);}
    if(hand2){fullDeck.push(hand2.name);}
    if(discardPile.length>0){
        for(let card of discardPile){
            fullDeck.push(card.name);
        }
    }
    if(deck.cards.length>0){
        for(let card of deck.cards){
            fullDeck.push(card.name);
        }
    }
    //create a JS object to hold both the player name and their deck
    let nameAndDeck = {name: playerName, deck: fullDeck}
    //Send to local storage
    storedDecks.push(nameAndDeck);
    let jsonDecks=[];
    //stringify items inside the storedDecks
    for(let obj of storedDecks){
        jsonDecks.push(JSON.stringify(obj));
    }
    jsonDecks = JSON.stringify(storedDecks);
    localStorage.setItem(decksSearchKey, jsonDecks);
}

//General setup for the game
function setup(){
    stage = app.stage;
    //Call from local storage
    storedNames = JSON.parse(localStorage.getItem(namesSearchKey));
    storedDecks = JSON.parse(localStorage.getItem(decksSearchKey));
    playerName = document.querySelector("#name").value;
    if(!storedNames){storedNames=[];}
    if(!storedDecks){storedDecks=[];}
    startScene = new PIXI.Container();
    stage.addChild(startScene)
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    displayScene = new PIXI.Container();
    displayScene.visible = false;
    stage.addChild(displayScene);
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    //Create the player sprite sheet
    createPlayerSheet();
    createEnemySheet();

    //load sounds
    createSounds();

    //instantiate deck and player
    player = new Player("Player", deck, playerSheet.idle, (3*sceneWidth)/4-50, sceneHeight/3);
    player.animationSpeed = .12;
    player.loop = true;
    player.scale.set(2,2);
    gameScene.addChild(player);
    player.play();
    //Create all enemies
    createEnemies();
    enemy.animationSpeed = .12;
    enemy.loop = true;
    enemy.scale.set(2,2);
    gameScene.addChild(enemy);
    enemy.play();
    buttonLabels = [];
    round=1;

    //add name labels over the characters
    let nameStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 36,
        stroke: 0xA62B00,
        strokeThickness: 2
    });
    playerNameL = new PIXI.Text(player.name);
    playerNameL.style = nameStyle;
    playerNameL.x = player.x-25;
    playerNameL.y = player.y-50;
    gameScene.addChild(playerNameL);
    enemyNameL = new PIXI.Text(enemy.name);
    enemyNameL.style = nameStyle;
    enemyNameL.x = enemy.x-5;
    enemyNameL.y = enemy.y-50;
    gameScene.addChild(enemyNameL);

    //create label for which round it is
    roundL = new PIXI.Text(`Round ${round}`);
    roundL.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 36,
        stroke: 0xE2B32B,
        strokeThickness: 2
    });
    roundL.x = sceneWidth/3+75;
    roundL.y = 50;
    gameScene.addChild(roundL);

    //Create labels and buttons for the scenes
    createStartLabelsAndButtons();
    createHowToPlayLabelsAndButtons();
    createGameLabelsAndButtons();
    createDisplaySceneLabelsandButtons();
    createGameOverLabelsAndButtons();

    //Start game update loop
    app.ticker.add(gameLoop);
}

//Assigns sound variables for the game
function createSounds(){
    click = new sound(app.loader.resources["click"].url);
    gunClick = new sound(app.loader.resources["gunClick"].url);
    gunShot = new sound(app.loader.resources["gunShot"].url);
    ricochet = new sound(app.loader.resources["ricochet"].url);
}

//Functionn to create player sheet and store animations in it
function createPlayerSheet(){
    let sSheet = new PIXI.BaseTexture.from(app.loader.resources["cowboy"].url);
    let w = 64;
    let h = 64;

    playerSheet["idle"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(5*w,0,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,0,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,0,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,0,w,h))
    ];
    playerSheet["draw"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(5*w,1*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,1*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,1*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,1*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,1*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(0*w,1*h,w,h))
    ];
    playerSheet["fire"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(5*w,2*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,2*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,2*h,w,h))
    ];
    playerSheet["dodge"] = [
        //Repeat a few times to add artificial length
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,3*h,w,h))
    ];
    playerSheet["die"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(5*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,3*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,3*h,w,h)),
    ];
    playerSheet["dead"] = [new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,3*h,w,h))];
}

//Functionn to create enemy sheet and store animations in it
function createEnemySheet(){
    let sSheet = new PIXI.BaseTexture.from(app.loader.resources["badGuy"].url);
    let w = 64;
    let h = 64;

    enemySheet["idle"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(0,4*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,4*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,4*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,4*h,w,h))
    ];
    enemySheet["draw"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(0,5*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,5*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,5*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,5*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,5*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(5*w,5*h,w,h))
    ];
    enemySheet["fire"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(0,6*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,6*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,6*h,w,h))
    ];
    enemySheet["dodge"] = [new PIXI.Texture(sSheet, new PIXI.Rectangle(w,7*h,w,h))];
    enemySheet["die"] = [
        new PIXI.Texture(sSheet, new PIXI.Rectangle(0,7*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(1*w,7*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(2*w,7*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(3*w,7*h,w,h)),
        new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,7*h,w,h)),
    ];
    enemySheet["dead"] = [new PIXI.Texture(sSheet, new PIXI.Rectangle(4*w,7*h,w,h))];
}

//Function to create all the enemies
function createEnemies()
{
    //Gary is the final enemy so his next will be default null
    let gary = new Enemy("Golden Gun Gary", 4, "", enemySheet.idle, sceneWidth/4-50, sceneHeight/3);
    //Everyone else will store the next enemy in their next property
    let weasle = new Enemy("Weasely William", 3, gary, enemySheet.idle, sceneWidth/4-50, sceneHeight/3);
    let barry = new Enemy("Basic Barry", 0, weasle, enemySheet.idle, sceneWidth/4-50, sceneHeight/3);
    let andy = new Enemy("Aggressive Andy", 2, barry, enemySheet.idle, sceneWidth/4-50, sceneHeight/3);
    let nick = new Enemy("Nervous Nick", 1, andy, enemySheet.idle, sceneWidth/4-50, sceneHeight/3);
    //Nervous Nick is the first enemy you fight so assign him to enemy
    enemy = nick;
}

//Function to fill the deck with cards
//FOR NOW, FILLS WITH SET CARDS, LATER WITH EARNED CARDS
function fillDeck(){
    //remove prior deck from the gameScene
    if(deck){
        for(let card of deck.cards){
            gameScene.removeChild(card);
        }
        if(hand1){gameScene.removeChild(hand1)}
        if(hand2){gameScene.removeChild(hand2)}
        for(let card of discardPile){gameScene.removeChild(card)}
        for(let card of deck.drawCards){
            gameScene.removeChild(card);
        }
    }
    let cards = [];
    let targets = [];
    //Create cards (only if they are in the player's locally stored deck)
    //Check if the player has a stored deck
    let localResponse = localStorage.getItem(decksSearchKey);
    if(localResponse){storedDecks = JSON.parse(localResponse);}
    let hasDeck;
    let deckObject;
    for(let obj of storedDecks){
        if(obj.name==playerName){hasDeck=true; deckObject=obj; break;}
    }
    //Only add cards in deck
    if(hasDeck){
        for(let card of deckObject.deck){
            if(card=="Phantom Bullet"){
                targets.push("reload");
                let phantom = new Card("Phantom Bullet", "attack", "Fire your weapon without needing to use a round in the chamber", targets, 0xD6A4DD, sceneWidth/2+30, sceneHeight-180);
                cards.push(phantom);
                for(let i of targets){targets.pop();}
            }
            else if(card=="Tracking Bullet"){
                targets.push("reload");
                targets.push("dodge");
                let tracking = new Card("Tracking Bullet", "attack", "Your bullet tracks your target and will even hit them if they try to dodge", targets, 0XFF7F7F, sceneWidth/2+110, sceneHeight-180);
                cards.push(tracking);
                for(let i of targets){targets.pop();}
            }
            else if(card=="Double Reload"){
                let double = new Card("Double Reload", "reload", "Load two rounds into your weapon instead of one", targets, 0xADD8E6, sceneWidth/2+30, sceneHeight-180);
                cards.push(double);
            }
            else if(card=="Reflect Dodge"){
                let reflect = new Card("Reflect Dodge", "dodge", "Your dodge reflects the opponent's bullet back at them, costs 1 of your own bullets to use", targets, 0x90EE91, sceneWidth/2+30, sceneHeight-180);
                cards.push(reflect);
            }
            else if(card=="Micro Bullet"){
                targets.push("reload");
                targets.push("attack");
                let small = new Card("Micro Bullet", "attack", "You shoot a bullet small enough to shoot through another bullet", targets, 0xFADADD, sceneWidth/2+30, sceneHeight-180);
                cards.push(small);
                for(let i of targets){targets.pop();}
            }
        }
    }
    //Phantom Bullet
    // targets.push("reload");
    // let phantom = new Card("Phantom Bullet", "attack", "Fire your weapon without needing to use a round in the chamber", targets, 0xD6A4DD, sceneWidth/2+30, sceneHeight-180);
    // cards.push(phantom);
    // for(let i of targets){targets.pop();}
    //Tracking Bullet
    // targets.push("reload");
    // targets.push("dodge");
    // let tracking = new Card("Tracking Bullet", "attack", "Your bullet tracks your target and will even hit them if they try to dodge", targets, 0XFF7F7F, sceneWidth/2+110, sceneHeight-180);
    // cards.push(tracking);
    // for(let i of targets){targets.pop();}
    //Double Reload
    // let double = new Card("Double Reload", "reload", "Load two rounds into your weapon instead of one", targets, 0xADD8E6, sceneWidth/2+30, sceneHeight-180);
    // cards.push(double);
    //Reflect dodge
    // let reflect = new Card("Reflect Dodge", "dodge", "Your dodge reflects the opponent's bullet back at them, costs 1 of your own bullets to use", targets, 0x90EE91, sceneWidth/2+30, sceneHeight-180);
    // cards.push(reflect);
    //Micro Bullet
    // targets.push("reload");
    // targets.push("attack");
    // let small = new Card("Micro Bullet", "attack", "You shoot a bullet small enough to shoot through another bullet", targets, 0xFADADD, sceneWidth/2+30, sceneHeight-180);
    // cards.push(small);

    //Put cards in the deck
    deck= new Deck(cards, sceneWidth/2+300, sceneHeight-180);
    //Remove cards from deck if they are in hand or discard
    let length = deck.cards.length;
    let toRemove = [];
    for(let i=0; i<length; i++){
        let card = deck.cards[i];
        if(hand1){if(card.name==hand1.name){toRemove.push(deck.cards.indexOf(card));}}
        else if(hand2){if(card.name==hand2.name){toRemove.push(deck.cards.indexOf(card));}}
        else if(discardPile.length>0){for(let discard of discardPile){
            if(card.name==discard.name){toRemove.push(deck.cards.indexOf(card));}
        }}
    }
    let cardsToRemove=[];
    for(let index of toRemove){
        cardsToRemove.push(deck.cards[index]);
    }
    for(let card of cardsToRemove)
    {
        deck.cards.splice(deck.cards.indexOf(card),1);
    }

    for(let drawCard of deck.drawCards){
        gameScene.addChild(drawCard);
    }
    for(let card of deck.cards){
        gameScene.addChild(card);
    }
    player.deck=deck;
    //Hide all cards in deck
    for(let card of deck.cards){card.visible=false;}
}

//Function to create buttons for start scene
function createStartLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        
    });

    let titleLabel = new PIXI.Text("*GoldenGuns*");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0xA62B00,
        fontSize: 88,
        stroke: 0xE2B32B,
        strokeThickness: 6,
        fontFamily: "Big Cowboy"
    });
    titleLabel.x = 0;
    titleLabel.y = sceneHeight/2 - 100;
    startScene.addChild(titleLabel);

    let startButton = new PIXI.Text("Draw!");
    startButton.style = buttonStyle;
    startButton.x = 60;
    startButton.y = sceneHeight/2 + 100;
    startButton.interactive = true;
    startButton. buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e => e.target.alpha = 0.7);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    let howToButton = new PIXI.Text("How to Play");
    howToButton.style = buttonStyle;
    howToButton.x = 60;
    howToButton.y = sceneHeight/2 + 160;
    howToButton.interactive = true;
    howToButton. buttonMode = true;
    howToButton.on("pointerup", showTutorial);
    howToButton.on("pointerover", e => e.target.alpha = 0.7);
    howToButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(howToButton);
}

function createHowToPlayLabelsAndButtons(){
    //square that is the popup for instructions
    const howToPop = new PIXI.Graphics();
    howToPop.beginFill(0xFDD797);
    howToPop.lineStyle(4, 0x8B4513, 1);
    howToPop.drawRect(0,0, (3*sceneWidth)/5, (2*sceneHeight)/3);
    howToPop.x = sceneWidth/5;
    howToPop.y = sceneHeight/3-100;
    howToPop.endFill();
    howToWindow = howToPop;
    startScene.addChild(howToPop);
    howToPop.visible=false;
    //Instructions style
    let instructStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 18,
        wordWrap: true,
        wordWrapWidth: (3*sceneWidth)/5-10
    });
    //text to describe gameplay
    let gist = new PIXI.Text("Duel your ways of the ranks of the best duelists in the west (and Nervous Nick). Collect ability cards as you defeat opponents to become the Golden Gun Duelist!");
    gist.style = instructStyle;
    gist.x = sceneWidth/5 + 5;
    gist.y = sceneHeight/3 + 5-100;
    gameplay = gist;
    startScene.addChild(gameplay);
    gameplay.visible=false;
    //text to explain how to use buttons
    let buttonExpo = new PIXI.Text("How to use buttons: Every turn you can choose from Attack, Reload, or Dodge. You can only attack if you have bullets in your chamber, displayed above the three buttons. After making your selection, click end turn.");
    buttonExpo.style = instructStyle;
    buttonExpo.x = sceneWidth/5 + 5;
    buttonExpo.y = sceneHeight/3 + 100-100;
    howButtons = buttonExpo;
    startScene.addChild(buttonExpo);
    buttonExpo.visible=false;
    //Explain how cards work
    let cardsExpo = new PIXI.Text("How to use cards: You will gain cards when you defeat opponents, these cards will be randomly dealt into your hand. Each run you will only get to use each card once so save them for the tougher opponents! Hover over the cards in your hand (Example card to right) and click on them to use them. Some cards have ammo requirements like buttons do. Select end turn after choosing a card OR button.");
    cardsExpo.style = instructStyle;
    cardsExpo.style.wordWrapWidth = cardsExpo.style.wordWrapWidth-80;
    cardsExpo.x = sceneWidth/5 + 5;
    cardsExpo.y = sceneHeight/3 + 200-100;
    howCards = cardsExpo;
    startScene.addChild(cardsExpo);
    cardsExpo.visible=false;
    //An example of what cards look like
    let exampleCard = new PIXI.Graphics();
    exampleCard.beginFill(0xD6A4DD);
    exampleCard.lineStyle(2, 0x000000, 1);
    exampleCard.drawRoundedRect(0,0, 60, 75,10);
    exampleCard.x = (3*sceneWidth)/5+120;
    exampleCard.y = sceneHeight/3 + 200-100;
    exampleCard.endFill();
    cardEx = exampleCard;
    startScene.addChild(exampleCard);
    exampleCard.visible=false;
    //Close text and button
    let closeBox = new PIXI.Graphics();
    closeBox.beginFill(0xC48E55);
    closeBox.lineStyle(2, 0x8B4513, 1);
    closeBox.drawRect(0,0, 180, 35);
    closeBox.x = sceneWidth/2-105;
    closeBox.y = sceneHeight/3 + 350-100;
    closeBox.interactive = true;
    closeBox.buttonMode = true;
    closeBox.on("pointerup", hideTutorial);
    closeBox.on("pointerover", e => e.target.alpha = 0.7);
    closeBox.on("pointerout", e => e.currentTarget.alpha = 1.0);
    closeB = closeBox;
    startScene.addChild(closeBox);
    closeBox.visible=false;

    let closeText = new PIXI.Text("Close Tutorials");
    closeText.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 24
    });
    closeText.x = sceneWidth/2-95;
    closeText.y = sceneHeight/3 + 353-100;
    closeL = closeText;
    startScene.addChild(closeText);
    closeText.visible=false;
}

//Function to show the tutorial popup
function showTutorial(){
    howToWindow.visible=true;
    gameplay.visible=true;
    howButtons.visible=true;
    howCards.visible=true;
    cardEx.visible=true;
    closeB.visible=true;
    closeL.visible=true;
}
//Function to hide the tutorial labels
function hideTutorial(){
    howToWindow.visible=false;
    gameplay.visible=false;
    howButtons.visible=false;
    howCards.visible=false;
    cardEx.visible=false;
    closeB.visible=false;
    closeL.visible=false;
}

function createGameLabelsAndButtons(){
    //Basic game view
    //square that is the taskbar at the bottom
    const taskbar = new PIXI.Graphics();
    taskbar.beginFill(0xFDD797);
    taskbar.lineStyle(4, 0x8B4513, 1);
    taskbar.drawRect(0,0, sceneWidth-4, sceneHeight/3);
    taskbar.x = 2;
    taskbar.y = sceneHeight-(sceneHeight/3 + 2);
    taskbar.endFill();
    gameScene.addChild(taskbar);

    //end turn button
    let endTurnBox = new PIXI.Graphics();
    endTurnBox.beginFill(0xC48E55);
    endTurnBox.lineStyle(2, 0x8B4513, 1);
    endTurnBox.drawRect(0,0, 110, 35);
    endTurnBox.x = 15;
    endTurnBox.y = sceneHeight - 185;
    endTurnBox.interactive = true;
    endTurnBox.buttonMode = true;
    endTurnBox.on("pointerup", checkEnd);
    endTurnBox.on("pointerover", e => e.target.alpha = 0.7);
    endTurnBox.on("pointerout", e => e.currentTarget.alpha = 1.0);
    endTurnB = endTurnBox;
    gameScene.addChild(endTurnBox);

    let endTurnButton = new PIXI.Text("End Turn");
    endTurnButton.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 24
    });
    endTurnButton.x = 20;
    endTurnButton.y = sceneHeight - 180;
    endTurnL = endTurnButton;
    gameScene.addChild(endTurnButton);

    //create the three circles that are the action buttons
    const attackButton = new PIXI.Graphics();
    createAction(attackButton, 0);
    attackB = attackButton;
    gameScene.addChild(attackButton);
    const dodgeButton = new PIXI.Graphics();
    createAction(dodgeButton, 1);
    dodgeB = dodgeButton;
    gameScene.addChild(dodgeButton);
    const reloadButton = new PIXI.Graphics();
    createAction(reloadButton, 2);
    reloadB = reloadButton;
    gameScene.addChild(reloadButton);

    //create labels for the action buttons
    let attackText = new PIXI.Text("Attack");
    attackText.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 16
    });
    attackText.x = attackButton.x - 22;
    attackText.y = attackButton.y - 50;
    attackL = attackText;
    buttonLabels.push(attackL);
    gameScene.addChild(attackText);

    let dodgeText = new PIXI.Text("Dodge");
    dodgeText.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 16
    });
    dodgeText.x = dodgeButton.x - 22;
    dodgeText.y = dodgeButton.y - 50;
    dodgeL = dodgeText;
    buttonLabels.push(dodgeL);
    gameScene.addChild(dodgeText);

    let reloadText = new PIXI.Text("Reload");
    reloadText.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 16
    });
    reloadText.x = reloadButton.x - 24;
    reloadText.y = reloadButton.y -50;
    reloadL = reloadText;
    buttonLabels.push(reloadL);
    gameScene.addChild(reloadText);

    //create circles to cover buttons when they aren't clickable
    covers = makeCovers();

    //Create label to show how many rounds are left in gun
    chamberIcon = new PIXI.Sprite.from(app.loader.resources["cylinder"].texture);
    chamberIcon.x = (1*sceneWidth)/4+45;
    chamberIcon.y = sceneHeight-200;
    updateChamber();
    chamberL = chamberIcon;
    gameScene.addChild(chamberIcon);
    //Create the popup that will display card info
    createCardPopUp()
}

//helper function to create action buttons
function createAction(button, index){
    let radius = 30;
    if(index==0){button.beginFill(0xFF0000);}
    else if(index==1){button.beginFill(0x228B22);}
    else{button.beginFill(0x0000FF);}
    button.drawCircle(0,0,radius);
    button.x = sceneWidth-((3*sceneWidth)/4)+index*80;
    if(index==1){button.y = sceneHeight-40;}
    else{button.y = sceneHeight-100;}
    button.interactive = true;
    button.buttonMode = true;
    if(index==0){button.on("pointerup", attack);}
    else if(index==1){button.on("pointerup", dodge);}
    else{button.on("pointerup", reload);}
    button.on("pointerup", e => {click.play();})
    button.on("pointerover", e => e.target.alpha = 0.7);
    button.on("pointerover", e => {buttonLabels[index].style.fill = 0xA62B00;});
    button.on("pointerout", e => e.currentTarget.alpha = 1.0);
    button.on("pointerout", e => {buttonLabels[index].style.fill = 0x000000;});
}

//helper function to create covers for buttons
function makeCovers() {
    let list = [];
    for(let i = 0; i < 3; i++)
    {
        let cover = new PIXI.Graphics();
        cover.beginFill(0x000000);
        cover.drawCircle(0,0,30);
        if(i==0){cover.x=attackB.x; cover.y=attackB.y;}
        else if(i==1){cover.x=dodgeB.x; cover.y=dodgeB.y;}
        else if(i==2){cover.x=reloadB.x; cover.y=reloadB.y;}
        cover.alpha = 0.6;
        list.push(cover);
        gameScene.addChild(cover);
    }
    return list;
}

//Function creates the blank popup that the card description will go it
function createCardPopUp(){
    //remove prior card popups
    gameScene.removeChild(cardPop);
    gameScene.removeChild(cardDesc);

    cardPop = new PIXI.Graphics();
    cardPop.beginFill(0xC48E55);
    cardPop.lineStyle(2, 0x8B4513, 1);
    cardPop.drawRect(0,0, 110, 130);
    cardPop.x = 0/*app.stage.data.global.x*/;
    cardPop.y = 0/*app.stage.data.global.y*/;
    cardPop.endFill();
    gameScene.addChild(cardPop);
    cardPop.visible = false;

    //Text label that says what the card does
    cardDesc = new PIXI.Text("");
    cardDesc.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: 106
    });
    cardDesc.x = 0;
    cardDesc.y = 0;
    gameScene.addChild(cardDesc);
    cardDesc.visible = false;
}

function createDisplaySceneLabelsandButtons(){
    //create the popup that displays round info
    popup = new PIXI.Graphics();
    popup.beginFill(0xC48E55);
    popup.lineStyle(4, 0x8B4513, 1);
    popup.drawRect(0,0, (3*sceneWidth)/4, sceneHeight/4);
    popup.x = sceneWidth/8;
    popup.y = sceneHeight-(sceneHeight/3 - 20);
    popup.endFill();
    displayScene.addChild(popup);

    //Text label that says what happened
    resultsLabel = new PIXI.Text(result);
    resultsLabel.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 30,
        wordWrap: true,
        wordWrapWidth: (3*sceneWidth)/4 - 100
    });
    resultsLabel.x = sceneWidth/8+25;
    resultsLabel.y = sceneHeight-(sceneHeight/3 - 40);
    displayScene.addChild(resultsLabel);

    //Style for display buttons
    let displayButtonStyle = new PIXI.TextStyle({
        fill: 0xA62B00,
        fontSize: 24,
        fontWeight: "bold"
    })
    //Create button that will move to next
    nextTurn = new PIXI.Text("Next Turn");
    nextTurn.style = displayButtonStyle;
    nextTurn.x = sceneWidth/8+25;
    nextTurn.y = sceneHeight-(sceneHeight/3 - 125);
    nextTurn.interactive = true;
    nextTurn.buttonMode = true;
    nextTurn.on("pointerup", e => {
        prepSwitch();
        mode = modes.PLAYERTURN; 
        round++;
        roundL.text = `Round ${round}`;
        dealHand();
    });
    nextTurn.on("pointerover", e => e.target.alpha = 0.7);
    nextTurn.on("pointerout", e => e.currentTarget.alpha = 1.0);
    displayScene.addChild(nextTurn);
    //Create game over prompt button
    goGameOver = new PIXI.Text("Game Over");
    goGameOver.style = displayButtonStyle;
    goGameOver.x = sceneWidth/8+25;
    goGameOver.y = sceneHeight-(sceneHeight/3 - 125);
    goGameOver.interactive = true;
    goGameOver.buttonMode = true;
    goGameOver.on("pointerup", gameOver);
    goGameOver.on("pointerover", e => e.target.alpha = 0.7);
    goGameOver.on("pointerout", e => e.currentTarget.alpha = 1.0);
    displayScene.addChild(goGameOver);
    //Create button that will bring in next fighter
    nextFighter = new PIXI.Text("Next Fighter");
    nextFighter.style = displayButtonStyle;
    nextFighter.x = sceneWidth/8 + 25;
    nextFighter.y = sceneHeight-(sceneHeight/3-125);
    nextFighter.interactive = true;
    nextFighter.buttonMode = true;
    nextFighter.on("pointerup", nextOpponent);
    nextFighter.on("pointerover", e => e.target.alpha = 0.7);
    nextFighter.on("pointerout", e => e.currentTarget.alpha = 1.0);
    displayScene.addChild(nextFighter);
}

function createGameOverLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        
    });
    gameOverLabel = new PIXI.Text("You Lose");
    gameOverLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        stroke: 0xFF0000,
        strokeThickness: 6,
        fontFamily: "Lost"
    });
    gameOverLabel.x = 50;
    gameOverLabel.y = 120;
    gameOverScene.addChild(gameOverLabel);

    let endButton = new PIXI.Text("Return to Menu");
    endButton.style = buttonStyle;
    endButton.x = 80;
    endButton.y = sceneHeight - 100;
    endButton.interactive = true;
    endButton.buttonMode = true;
    endButton.on("pointerup", goStart);
    endButton.on("pointerover", e => e.target.alpha = 0.7);
    endButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(endButton);

    let retryButton = new PIXI.Text("Play Again");
    retryButton.style = buttonStyle;
    retryButton.x = 80;
    retryButton.y = sceneHeight - 150;
    retryButton.interactive = true;
    retryButton. buttonMode = true;
    retryButton.on("pointerup", startGame);
    retryButton.on("pointerover", e => e.target.alpha = 0.7);
    retryButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(retryButton);
}

//Start the game
function startGame(){
    //Refill deck
    for(let i=0; i=discardPile.length; i++){discardPile.pop();}
    gameScene.removeChild(hand1);
    gameScene.removeChild(hand2);
    hand1 = null;
    hand2 = null;
    fillDeck();
    createCardPopUp();
    prepSwitch();
    //Reset gun chambers and life
    player.isAlive = true;
    enemy.isAlive = true;
    player.chamber = 0;
    enemy.chamber = 0;
    updateChamber();
    //Reset player animation
    player.textures = playerSheet.idle;
    player.animationSpeed = .12;
    player.loop = true;
    player.play();
    //switch mode
    mode = modes.PLAYERTURN;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    displayScene.visible = false;
    round=1;
    roundL.text = `Round ${round}`;
    hideOption();
    //Deal hand cards
    hand1X = sceneWidth/2+30;
    hand1Y = sceneHeight-180;
    hand2X = sceneWidth/2+110;
    hand2Y = sceneHeight-180;
    dealHand();
}

//return to the start scene
function goStart(){
    mode = modes.TITLE;
    startScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
    displayScene.visible = false;
    prepSwitch();
}
//Go to game over scene
function gameOver(){
    //If you won when defeating golden gun gary, get a card
    if(enemy.name=="Golden Gun Gary"&&player.isAlive){giveCard(); saveDeck();}
    gameScene.removeChild(enemy);
    mode = modes.GAMEOVER;
    startScene.visible = false;
    gameOverScene.visible = true;
    displayScene.visible = false;
    gameScene.visible = false;
    //Reset game parameters
    prepSwitch();
    createEnemies();
    enemy.animationSpeed = .12;
    enemy.loop = true;
    enemy.scale.set(2,2);
    gameScene.addChild(enemy);
    enemy.play();
    enemyNameL.text = enemy.name;
    //Display different message on top depending who won
    if(player.isAlive){
        gameOverLabel.text = "You win!";
        gameOverLabel.style.fontFamily = "Big Cowboy";    
    }
    else if(enemy.isAlive){
        gameOverLabel.text = "You Lose...";
        gameOverLabel.style.fontFamily = "Lost";
    }
}

function nextOpponent(){
    //Give player a new card if they don't have that fighter's card already
    giveCard();
    saveDeck();
    //fillDeck();
    dealHand();
    prepSwitch();
    mode = modes.PLAYERTURN;
    player.chamber = 0;
    round = 1;
    roundL.text = `Round ${round}`;
    gameScene.removeChild(enemy);
    enemy = enemy.next;
    enemy.animationSpeed = .12;
    enemy.loop = true;
    enemy.scale.set(2,2);
    gameScene.addChild(enemy);
    enemy.play();
    hideOption();
    updateChamber();
    enemyNameL.text = enemy.name;
}

//Function gives a card that corresponds to the fighter to the player if they don't have it
function giveCard(){
    let targets=[];
    if(enemy.name=="Nervous Nick"){
        let double = new Card("Double Reload", "reload", "Load two rounds into your weapon instead of one", targets, 0xADD8E6, sceneWidth/2+30, sceneHeight-180);
        findCard(double);
        // let inDeck=false;
        // for(let card of deck.cards){
        //     if(card.name==double.name){inDeck=true;}
        // }
        // if(!inDeck){
        //     let inDisc=false;
        //     for(let card of discardPile){
        //         if(card.name==double.name){inDisc=true;}
        //     }
        //     if(!inDisc){
        //     if(hand1){if(hand1.name!=double.name){
        //         if(hand2){if(hand2.name!=double.name){deck.cards.push(double);}}
        //     }}
        //     else{deck.cards.push(double);}}
        // }
    }
    else if(enemy.name=="Aggressive Andy"){
        targets.push("reload");
        targets.push("attack");
        let small = new Card("Micro Bullet", "attack", "You shoot a bullet small enough to shoot through another bullet", targets, 0xFADADD, sceneWidth/2+30, sceneHeight-180);
        findCard(small);
        // let inDeck=false;
        // for(let card of deck.cards){
        //     if(card.name==small.name){inDeck=true;}
        // }
        // if(!inDeck){
        //     let inDisc=false;
        //     for(let card of discardPile){
        //         if(card.name==small.name){inDisc=true;}
        //     }
        //     if(!inDisc){
        //     if(hand1){if(hand1.name!=small.name){
        //         if(hand2){if(hand2.name!=small.name){deck.cards.push(small);}}
        //         else{deck.cards.push(small);}
        //     }}
        //     else{deck.cards.push(small);}}
        // }
    }
    else if(enemy.name=="Basic Barry"){
        targets.push("reload");
        targets.push("dodge");
        let tracking = new Card("Tracking Bullet", "attack", "Your bullet tracks your target and will even hit them if they try to dodge", targets, 0XFF7F7F, sceneWidth/2+110, sceneHeight-180);
        findCard(tracking);
        // let inDeck=false;
        // for(let card of deck.cards){
        //     if(card.name==tracking.name){inDeck=true;}
        // }
        // if(!inDeck){
        //     let inDisc=false;
        //     for(let card of discardPile){
        //         if(card.name==tracking.name){inDisc=true;}
        //     }
        //     if(!inDisc){
        //     if(hand1){if(hand1.name!=tracking.name){
        //         if(hand2){if(hand2.name!=tracking.name){deck.cards.push(tracking);}}
        //         else{deck.cards.push(tracking);}
        //     }}
        //     else{deck.cards.push(tracking);}}
        // }
    }
    else if(enemy.name=="Weasely William"){
        let reflect = new Card("Reflect Dodge", "dodge", "Your dodge reflects the opponent's bullet back at them, costs 1 of your own bullets to use", targets, 0x90EE91, sceneWidth/2+30, sceneHeight-180);
        findCard(reflect);
        // let inDeck=false;
        // for(let card of deck.cards){
        //     if(card.name==reflect.name){inDeck=true;}
        // }
        // if(!inDeck){
        //     let inDisc=false;
        //     for(let card of discardPile){
        //         if(card.name==reflect.name){inDisc=true;}
        //     }
        //     if(!inDisc){
        //     if(hand1){if(hand1.name!=reflect.name){
        //         if(hand2){if(hand2.name!=reflect.name){deck.cards.push(reflect);}}
        //         else{deck.cards.push(reflect);}
        //     }}
        //     else{deck.cards.push(reflect);}}
        // }
    }
    else if(enemy.name=="Golden Gun Gary"){
        targets.push("reload");
        let phantom = new Card("Phantom Bullet", "attack", "Fire your weapon without needing to use a round in the chamber", targets, 0xD6A4DD, sceneWidth/2+30, sceneHeight-180);
        findCard(phantom);
        // let inDeck=false;
        // for(let card of deck.cards){
        //     if(card.name==phantom.name){inDeck=true;}
        // }
        // if(!inDeck){
        //     let inDisc=false;
        //     for(let card of discardPile){
        //         if(card.name==phantom.name){inDisc=true;}
        //     }
        //     if(!inDisc){
        //     if(hand1){if(hand1.name!=phantom.name){
        //         if(hand2){if(hand2.name!=phantom.name){deck.cards.push(phantom);}}
        //         else{deck.cards.push(phantom);}
        //     }}
        //     else{deck.cards.push(phantom);}}
        // }
    }
}

//Helped function to check if a card already exists in play somewhere
function findCard(theCard){
    let inDeck=false;
    for(let card of deck.cards){
        if(card.name==theCard.name){inDeck=true;}
    }
    if(!inDeck){
        let inDisc=false;
        for(let card of discardPile){
            if(card.name==theCard.name){inDisc=true;}
        }
        if(!inDisc){
        if(hand1){if(hand1.name!=theCard.name){
            if(hand2){if(hand2.name!=theCard.name){deck.cards.push(theCard);}}
            else{deck.cards.push(theCard);}
        }}
        else{deck.cards.push(theCard);}}
    }
}

//Function assigns 2 of the cards from the deck into the hand
function dealHand(){
    if(!hand1&&deck.cards.length>0)
    {
        let randomNum = Math.floor(Math.random()*(deck.cards.length))
        hand1 = deck.cards[randomNum];
        hand1.visible=true;
        hand1.x = hand1X;
        hand1.y = hand1Y;
        //remove card from the deck
        deck.cards.splice(randomNum,1);
    }
    if(!hand2&&deck.cards.length>0)
    {
        let randomNum = Math.floor(Math.random()*(deck.cards.length));
        hand2 = deck.cards[randomNum];
        hand2.visible=true;
        hand2.x = hand2X;
        hand2.y = hand2Y;
        //remove card from the deck
        deck.cards.splice(randomNum,1);
    }
    //hide cards not in hand
    for(let card of deck.cards)
    {
        card.visible=false;
    }
    if(hand1){gameScene.addChild(hand1);}
    if(hand2){gameScene.addChild(hand2);}
    //Assign hand controls to first card
    if(hand1){handControls(hand1);}
    //Assign hand controls to second card
    if(hand2){handControls(hand2);}
    //Create popup every new hand so that it appears on top 
    createCardPopUp();
}

//create hand controls
function handControls(hand){
    hand.interactive=true;
    hand.buttonMode=true;
    hand.on("pointerover", animateUp);
    hand.on("pointerover", showDesc);
    hand.on("pointerout", returnToHand);
    hand.on("pointerout", hideDesc);
    hand.on("pointerup", cardSelected);
}
//Function to animate the selected card to move up
function animateUp(e){
    if(!cardPlayed||e.target!=cardPlayed){
        e.target.y = e.target.yInit-10;
        movedCard = e.target;
    }
}
//Function to move the card back down when pointer isn't on it anymore
function returnToHand(e){
    if(!cardPlayed || cardPlayed!=movedCard){
        movedCard.y = movedCard.yInit;
    }
}
//function to show window that holds description of what card does
function showDesc(e){
    cardPop.x = e.target.x+5;
    cardPop.y = e.target.y-85;
    let cardText = `${e.target.name}: ${e.target.desc}`;
    cardDesc.text = cardText;
    cardDesc.x = e.target.x+9;
    cardDesc.y = e.target.y-83;
    cardPop.visible = true;
    cardDesc.visible = true;
    // //Move card in front of other
    // let otherCard;
    // if(hand1==e.target){otherCard=hand2;}
    // if(hand2==e.target){otherCard=hand1;}
    // gameScene.children.insertBefore(gameScene.removeChild(e.target), gameScene.children[gameScene.children.indexOf(otherCard)]);
}
//Function to hide description when the mouse is no longer on the card
function hideDesc(e){
    cardPop.visible = false;
    cardDesc.visible = false;
}
//Function to mark the card as selected an apply appropriate logic
function cardSelected(e){
    cardPlayed=e.target;
    cardPlayed.y = cardPlayed.yInit-15;
    for(let card of deck.cards){
        if(card!=cardPlayed){card.y=card.yInit;}
    }
    player.useCard(cardPlayed);
    playerAction=player.action;
    if(!playerAction){
        cardPlayed=null;
        e.target.y = e.target.yInit-10;
    }
    //Remove highlights if a button was previously chosen
    if(playerAction){
        attackL.style.fill = 0x000000;
        dodgeL.style.fill = 0x000000;
        reloadL.style.fill = 0x000000;
        attackL.style.fontWeight = "normal";
        dodgeL.style.fontWeight = "normal";
        reloadL.style.fontWeight = "normal";
        hideOption();
    }
}

//Updates the amount of rounds in the chamber when a turn changes
function updateChamber(){
    //chamberIcon.text = `Chamber: ${player.chamber}/6`;
    let i = bullets.length;
    for(let j=0; j<i; j++){
        gameScene.removeChild(bullets.pop());
    }
    // if(player.chamber==0){
    //     for(let i of bullets){
    //         gameScene.removeChild(bullets.pop());
    //     }
    // }
    if(player.chamber>0){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[0].x = sceneWidth/4+76;
        bullets[0].y = sceneHeight-190;
    }
    if(player.chamber>1){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[1].x = sceneWidth/4+95;
        bullets[1].y = sceneHeight-178;
    }
    if(player.chamber>2){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[2].x = sceneWidth/4+93;
        bullets[2].y = sceneHeight-157;
    }
    if(player.chamber>3){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[3].x = sceneWidth/4+76;
        bullets[3].y = sceneHeight-145;
    }
    if(player.chamber>4){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[4].x = sceneWidth/4+59;
        bullets[4].y = sceneHeight-158;
    }
    if(player.chamber>5){
        bullets.push(new PIXI.Sprite.from(app.loader.resources["bullet"].texture));
        bullets[5].x = sceneWidth/4+59;
        bullets[5].y = sceneHeight-178;
    }

    for(let bullet of bullets){
        gameScene.addChild(bullet);
        bullet.visible=false;
    }
}

//Function to display to the player that an option is unavailable
function hideOption(){
    for(let labels of buttonLabels){labels.style.strokeThickness = 0;}
    for(let cover of covers){cover.visible=false;}
    if(player.chamber<1){
        covers[0].visible=true;
        attackB.interactive = false;
        attackL.style.fill = 0xFDD797;
        attackL.style.stroke = 0x000000;
        attackL.style.strokeThickness = 1;
    }
    if(player.chamber>5){
        covers[2].visible=true;
        reloadB.interactive=false;
        reloadL.style.fill = 0xFDD797;
        reloadL.style.stroke = 0x000000;
        reloadL.style.strokeThickness = 1;
    }
}

//Function calls player attack function and sets playerAction as attack
function attack(){
    player.attack(); 
    playerAction=player.action;
    if(playerAction){
        attackL.style.fill = 0xA62B00;
        dodgeL.style.fill = 0x000000;
        reloadL.style.fill = 0x000000;
        attackL.style.fontWeight = "bold";
        dodgeL.style.fontWeight = "normal";
        reloadL.style.fontWeight = "normal";
        hideOption();
    }
    //Prevent card from being played if a card is selected
    if(cardPlayed){
        cardPlayed.y = cardPlayed.yInit;
        cardPlayed=null;
    }
}
//Function calls player reload function and sets playerAction as reload
function reload(){
    player.reload(); 
    playerAction=player.action;
    if(playerAction){
        reloadL.style.fill = 0xA62B00;
        attackL.style.fill = 0x000000;
        dodgeL.style.fill = 0x000000;
        reloadL.style.fontWeight = "bold";
        dodgeL.style.fontWeight = "normal";
        attackL.style.fontWeight = "normal";
        hideOption();
    }
    //Prevent card from being played if a card is selected
    if(cardPlayed){
        cardPlayed.y = cardPlayed.yInit;
        cardPlayed=null;
    }
}
//Function calls player reload function and sets playerAction as reload
function dodge(){
    player.dodge(); 
    playerAction=player.action;
    if(playerAction){
        dodgeL.style.fill = 0xA62B00;
        attackL.style.fill = 0x000000;
        reloadL.style.fill = 0x000000;
        dodgeL.style.fontWeight = "bold";
        attackL.style.fontWeight = "normal";
        reloadL.style.fontWeight = "normal";
        hideOption();
    }
    //Prevent card from being played if a card is selected
    if(cardPlayed){
        cardPlayed.y = cardPlayed.yInit;
        cardPlayed=null;
    }
}

//function to check if turn can end
function checkEnd()
{
    if(playerAction){
        prepSwitch();
        //reset label colors
        attackL.style.fill = 0x000000;
        dodgeL.style.fill = 0x000000;
        reloadL.style.fill = 0x000000;
        dodgeL.style.fontWeight = "normal";
        attackL.style.fontWeight = "normal";
        reloadL.style.fontWeight = "normal";
    }
}

//function to prep game for enemy turn
function prepSwitch()
{
    switch(mode) {
        case modes.PLAYERTURN:
            mode = modes.ENEMYTURN;
            endTurnL.visible = false;
            endTurnB.visible = false;
            attackB.visible = false;
            dodgeB.visible = false;
            reloadB.visible = false;
            attackL.visible = false;
            dodgeL.visible = false;
            reloadL.visible = false;
            chamberL.visible = false;
            if(hand1){
                hand1.visible = false;
                hand1.y=hand1.yInit;
            }
            if(hand2){
                hand2.visible = false;
                hand2.y=hand2.yInit;
            }
            for(let deckCard of deck.drawCards){
                deckCard.visible = false;
            }
            for(let cover of covers)
            {
                cover.visible=false;
            }
            break;
        default:
            endTurnL.visible = true;
            endTurnB.visible = true;
            attackB.visible = true;
            dodgeB.visible = true;
            reloadB.visible = true;
            attackB.interactive = true;
            dodgeB.interactive = true;
            reloadB.interactive = true;
            attackL.visible = true;
            dodgeL.visible = true;
            reloadL.visible = true;
            chamberL.visible = true;
            if(hand1){
                hand1.visible = true;
                hand1.y=hand1.yInit;
            }
            if(hand2){
                hand2.visible = true;
                hand2.y=hand2.yInit;
            }
            for(let deckCard of deck.drawCards){
                deckCard.visible = true;
            }
            for(let bullet of bullets){
                bullet.visible=true;
            }
            hideOption();
            displayScene.visible = false;
            break;
    }
}

//funciton to display a box that showed what happened this turn
function displayResult()
{
    //Update text label to current result
    resultsLabel.text = result;

    //Show and update next turn button if all are alive
    if(player.isAlive && enemy.isAlive)
    {
        goGameOver.visible = false;
        nextTurn.visible = true;
        nextFighter.visible = false;
    }
    else if(player.isAlive && !enemy.isAlive &&enemy.next)
    {
        nextTurn.visible = false;
        goGameOver.visible = false;
        nextFighter.visible = true;
    }
    //Show and update goGameOver button if anyone is dead
    else
    {
        nextTurn.visible = false;
        goGameOver.visible = true;
        nextFighter.visible = false;
    }
    displayScene.visible=true;
}

//Function to determine turn result
function determineResult()
{
    //create blank card in case needed for checks
    let blankCard = new Card("","","","","",0,0);
    if(!cardPlayed){cardPlayed=blankCard;}
    if(playerAction=="attack")
    {
        if(enemyAction=="attack"){
            if(cardPlayed.name=="Micro Bullet"){
                result = `${player.name} and ${enemy.name} shot at each other but ${player.name}'s bullet broke through the other and hit ${enemy.name}`;
                resultCombo = results.AA;
                enemy.isAlive=false;
            }
            else{
                result = `${player.name} and ${enemy.name}'s bullets ricocheted off each other`;
                resultCombo = results.AA;
            }
        }
        else if(enemyAction=="dodge"){
            if(cardPlayed.name=="Tracking Bullet"){
                result = `${enemy.name} tried to dodge but ${player.name}'s tracking bullet hit them`;
                resultCombo = results.TRACKED;
                enemy.isAlive=false;
            }
            else{
                result = `${enemy.name} dodged ${player.name}'s shot`;
                resultCombo = results.AD;
            }
        }
        else if(enemyAction=="reload"){
            result = `${player.name} shot ${enemy.name}`;
            enemy.isAlive = false;
            resultCombo = results.AR;
        }
    }
    else if(playerAction=="reload")
    {
        if(enemyAction=="attack"){
            result = `${enemy.name} shot ${player.name}`;
            player.isAlive = false;
            resultCombo = results.RA;
        }
        else if(enemyAction=="dodge"){
            result = `${enemy.name} dodged while ${player.name} loaded another round`;
            resultCombo = results.RD;
        }
        else if(enemyAction=="reload"){
            result = `${player.name} and ${enemy.name} both loaded another round`;
            resultCombo = results.RR;
        }
    }
    else if(playerAction=="dodge")
    {
        if(enemyAction=="attack"){
            if(cardPlayed.name=="Reflect Dodge"){
                result = `${player.name} reflected ${enemy.name}'s shot back at them`;
                resultCombo = results.REFLECT;
                enemy.isAlive=false;
            }
            else{
                result = `${player.name} dodged ${enemy.name}'s shot`;
                resultCombo = results.DA;
            }
        }
        else if(enemyAction=="dodge"){
            result = `${player.name} and ${enemy.name} both tried to dodge each other's nonexistant shots`;
            resultCombo = results.DD;
        }
        else if(enemyAction=="reload"){
            result = `${player.name} dodged while ${enemy.name} loaded another round`;
            resultCombo = results.DR;
        }
    }
    if(cardPlayed==blankCard){cardPlayed=null;}
}


//Function contains a switch statement that plays the animations of player and AI choices then switches to display results screen
function playTurnAnimation(){
    switch (resultCombo) {
        case results.AA:
            //Player animation
            playerAttack()
            //Enemy animation
            enemyAttack();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.AD:
            //Player animation
            playerAttack();
            //Enemy animation
            enemyDodge();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.AR:
            //Player animation
            playerAttack()
            //Enemy animation
            enemyDie();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.DA:
            //Player animation
            playerDodge();
            //Enemy animation
            enemyAttack();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.DD:
            //Player animation
            playerDodge();
            //Enemy animation
            enemyDodge();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.DR:
            //Player animation
            playerDodge();
            //Enemy animation
            enemyReload();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.RA:
            //Player animation
            playerDie();
            //Enemy animation
            enemyAttack();
            //Switch out of mode when finishing all animations
            leaveAnimation(0,0);
            break;
        case results.RD:
            //Player Animation
            playerReload();
            //enemy Animation
            enemyDodge();
            leaveAnimation(0,0);
            break;
        case results.RR:
            //player animation
            playerReload();
            //enemy animation
            enemyReload();
            leaveAnimation(0,0);
            break;
        case results.REFLECT:
            //player animation
            playerDodge();
            //enemy animation
            if(enemyAnimFunction==0){
                enemyAttack();
                if(enemyAnimPart>1){enemyAnimPart=0;}}
            if(enemyAnimFunction==1){enemyDie();}
            leaveAnimation(0,1);
            break;
        case results.TRACKED:
            //player animation
            playerAttack();
            //enemyAnimation
            if(enemyAnimFunction==0){
                enemyDodge();
                if(enemyAnimPart>1){enemyAnimPart=0;}}
            if(enemyAnimFunction==1){enemyDie();}
            leaveAnimation(0,1);
            break;
    }
}

//Helper function to get out of animations
function leaveAnimation(maxFunP, maxFunE){
    if(!player.playing&&!enemy.playing&&playerAnimFunction>maxFunP&&enemyAnimFunction>maxFunE)
    {
        if(resultCombo==results.AA){ricochet.play();}
        playerAnimFunction=0;
        enemyAnimFunction=0;
        playerAnimPart=0;
        enemyAnimPart=0;
        resultCombo = null;
        mode = modes.DISPLAYRESULT;
    }
}

//Function to play each animation for a player
function playerAttack(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!player.playing&&playerAnimPart==0){
        player.textures = playerSheet.draw;
        player.animationSpeed = .12;
        player.loop = false;
        player.play();
        playerAnimPart++;
    }
    else if(!player.playing&&playerAnimPart==1)
    {
        player.textures = playerSheet.fire;
        player.animationSpeed = .12;
        player.loop = false;
        player.play();
        gunShot.play();
        playerAnimPart++;
        playerAnimFunction++;
    }
    else if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    }
}
function playerDodge(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!player.playing&&playerAnimPart==0){
        player.textures = playerSheet.dodge;
        player.animationSpeed = .05;
        player.loop = false;
        player.play();
        playerAnimPart++;
        playerAnimFunction++;
    }
    else if(!player.playing&&playerAnimPart>0){keepPlaying=false;}
    }
}
function playerReload(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!player.playing&&playerAnimPart==0){
        player.textures = playerSheet.draw;
        player.animationSpeed = .12;
        player.loop = false;
        player.play();
        gunClick.play();
        playerAnimPart++;
        playerAnimFunction++;
    }
    else if(!player.playing&&playerAnimPart>0){keepPlaying=false;}
    }
}
function playerDie(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!player.playing&&playerAnimPart==0)
    {
        player.textures = playerSheet.draw;
        player.animationSpeed = .12;
        player.loop = false;
        player.play();
        playerAnimPart++;
    }
    else if(!player.playing&&playerAnimPart==1)
    {
        player.textures = playerSheet.die;
        player.animationSpeed = .12;
        player.loop = false;
        player.play();
        playerAnimPart++;
        playerAnimFunction++;
    }
    else if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    }
}
function enemyAttack(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!enemy.playing&&enemyAnimPart==0){
        enemy.textures = enemySheet.draw;
        enemy.animationSpeed = .12;
        enemy.loop = false;
        enemy.play();
        enemyAnimPart++;
    }
    else if(!enemy.playing&&enemyAnimPart==1)
    {
        enemy.textures = enemySheet.fire;
        enemy.animationSpeed = .12;
        enemy.loop = false;
        enemy.play();
        gunShot.play();
        enemyAnimPart++;
        enemyAnimFunction++;
    }
    else if(!enemy.playing&&enemyAnimPart>1){keepPlaying=false;}
    }
}
function enemyDodge(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!enemy.playing&&enemyAnimPart==0){
        enemy.textures = enemySheet.dodge;
        enemy.animationSpeed = .05;
        enemy.loop = false;
        enemy.play();
        enemyAnimPart++;
        enemyAnimFunction++;
    }
    else if(!enemy.playing&&enemyAnimPart>0){keepPlaying=false;}
    }
}
function enemyReload(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!enemy.playing&&enemyAnimPart==0)
    {
        enemy.textures = enemySheet.draw;
        enemy.animationSpeed = .12;
        enemy.loop = false;
        enemy.play();
        gunClick.play();
        enemyAnimPart++;
        enemyAnimFunction++;
    }
    else if(!enemy.playing&&enemyAnimPart>0){keepPlaying=false;}
    }
}
function enemyDie(){
    let keepPlaying=true;
    if(!player.playing&&playerAnimPart>1){keepPlaying=false;}
    if(keepPlaying){
    if(!enemy.playing&&enemyAnimPart==0){
        enemy.textures = enemySheet.draw;
        enemy.animationSpeed = .12;
        enemy.loop = false;
        enemy.play();
        enemyAnimPart++;
    }
    else if(!enemy.playing&&enemyAnimPart==1)
    {
        enemy.textures = enemySheet.die;
        enemy.animationSpeed = .12;
        enemy.loop = false;
        enemy.play();
        enemyAnimPart++;
        enemyAnimFunction++;
    }
    else if(!enemy.playing&&enemyAnimPart>1){keepPlaying=false;}
    }
}

//Check while animation or still frame player and enemy should be in and assign it to them
function whatFinalSprite(){
    //If player is alive, return to idle animation
    if(player.isAlive)
    {
        player.textures = playerSheet.idle;
        player.animationSpeed = .12;
        player.loop = true;
        player.play();
    }
    //If dead, make lay dead
    else{
        player.textures = playerSheet.dead;
        player.animationSpeed = .12;
        player.loop = true;
        player.play();
    }
    //If enemy is alive, return to idle
    if(enemy.isAlive)
    {
        enemy.textures = enemySheet.idle;
        enemy.animationSpeed = .12;
        enemy.loop = true;
        enemy.play();
    }
    //If dead, make enemy lay dead
    else{
        enemy.textures = enemySheet.dead;
        enemy.animationSpeed = 1;
        enemy.loop = true;
        enemy.play();
    }
}

//Function to put card in discard pile after a turn ends and remove it from the deck
//Next deal a new hand
function discardUsedCard(){
    discardPile.push(cardPlayed);
    if(hand1==cardPlayed){
        hand1=hand2; 
        if(hand1){
            hand1.x = hand1X;
            hand1.y = hand1Y;
        }
        hand2=null;
    }
    else if(hand2==cardPlayed){hand2=null;}
    //deal new hand
    dealHand();
    cardPlayed=null;
}


//PRIMARY GAME LOOP
function gameLoop(){
    //Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
    //Turn based control switch
    switch (mode) {
        case modes.PLAYERTURN:
            break;
        case modes.ENEMYTURN:
            enemy.chooseAction(player);
            enemyAction = enemy.action;
            //update player chamber counts
            //fill card played (if null) to prevent error
            let blankCard = new Card("","","","","",0,0);
            if(!cardPlayed){cardPlayed=blankCard;}
            if(playerAction=="reload"){
                if(cardPlayed.name=="Double Reload"){player.chamber=player.chamber+2;}
                else{player.chamber = player.chamber+1;}
            }
            else if(playerAction=="attack"){
                if(cardPlayed.name=="Phantom Bullet"){}
                else{player.chamber = player.chamber-1;}
            }
            else if(cardPlayed=="Reflect Dodge"){player.chamber = player.chamber-1;}
            //remove blank card from card played (if assigned)
            if(cardPlayed==blankCard){cardPlayed=null;}
            updateChamber();
            player.loop=false;
            enemy.loop=false;
            mode = modes.PLAYACTION;
            break;
        case modes.PLAYACTION:
            determineResult();
            playTurnAnimation();
            // mode = modes.DISPLAYRESULT;
            // displayScene.visible = true;
            break;
        case modes.DISPLAYRESULT:
            whatFinalSprite();
            displayResult();
            if(cardPlayed){discardUsedCard();}
            playerAction = null;
            enemyAction = null;
            break;
    }
}