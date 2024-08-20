window.onload = (e) => {
    assignMapButtons();
    let map = document.querySelector("#mapImg");
    map.onload = (e) => {
    createHouses();
    placeHouses();
    assignHouseButtons();}
    map.src = "./media/julio-lacerda/north-westeros.jpeg"
    // whatMap();
}

//variables for controlling local storage
const prefix = "nca6109-";
const charSearchKey = prefix+"charSearch";
const houseSearchKey = prefix+"houseSearch";
const booksSearchKey = prefix+"booksSearch";

const storedCharSearch = localStorage.getItem(charSearchKey);
const storedHouseSearch = localStorage.getItem(houseSearchKey);
const storedBooksSearch = localStorage.getItem(booksSearchKey);

//varibales to control the page
let mapOf = "north-westeros"
let sigil;

//character making variables
let father=makeLinkedName();
let mother=makeLinkedName();
let spouse=makeLinkedName();
const allegiances = [];
const books = [];
const povBooks = [];
//house making variables
let house;
let currentLord=makeLinkedName();
let heir=makeLinkedName();
let overlord=makeLinkedName();
let founder=makeLinkedName();
const cadetBranches = [];
const swornMembers = [];
//book making variables
const foundChars = [];
const foundPOVChars = [];

//assign buttons on the map header an event that changes the map when clicked
function assignMapButtons()
{
    let continents = document.querySelectorAll(".continent");
    for(let i=0; i<continents.length; i++)
    {
        continents[i].addEventListener("click", changeMap);
        continents[i].addEventListener("mouseover", 
        hovered = (e) => {e.target.style.fontWeight="bold"});
        continents[i].addEventListener("mouseout", noHover = (e) => {e.target.style.fontWeight="normal"});
    }
}

//Make every house crest a button that brings up a popup of info on that house
function assignHouseButtons()
{
    let houses = document.querySelectorAll("#map img");
    for(let house of houses)
    {
        if(house.id!="mapImg"){
        house.addEventListener("click", createHouse);
        house.addEventListener("mouseover", houseHover);
        house.addEventListener("mouseout", houseNoHover);}
    }
}
//Style functions for when a house is hovered and unhovered
function houseHover(e)
{
    let house = e.target;
    //clunky way to tell if it is one of the unique boxes
    if(house.dataset.url=="https://anapioficeandfire.com/api/houses/16"&&mapOf=="central-westeros")
    {
        house.style.width = "27px";
        house.style.height = "27px";
    }
    else if(house.dataset.url=="https://anapioficeandfire.com/api/houses/378")
    {
        house.style.width = "64px";
        house.style.height = "64px";
    }
    else
    {
        house.style.width = "42px";
        house.style.height = "42px";
    }
    house.style.boxShadow = "2px -2px 5px -1px #020202";
}
function houseNoHover(e)
{
    let house = e.target;
    //clunky way to tell if it is one of the unique boxes
    if(house.dataset.url=="https://anapioficeandfire.com/api/houses/16"&&mapOf=="central-westeros")
    {
        house.style.width = "25px";
        house.style.height = "25px";
    }
    else if(house.dataset.url=="https://anapioficeandfire.com/api/houses/378")
    {
        house.style.width = "60px";
        house.style.height = "60px";
    }
    else
    {
        house.style.width = "40px";
        house.style.height = "40px";
    }
    house.style.boxShadow = "none";
}

//Function creates a section below the map and fills it with information about the house clicked on
function createHouse(e)
{
    sigil = e.target.src;
    //delete the current popup
    let popup = document.querySelector("section");
    if(popup){popup.remove();}
    //clear the values of the global variables
    currentLord=makeLinkedName();
    heir=makeLinkedName();
    overlord=makeLinkedName();
    founder=makeLinkedName();
    cadetBranches.splice(0,cadetBranches.length);
    swornMembers.splice(0, swornMembers.length);

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = foundHouse;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", e.target.dataset.url);
    xhr.send();

}

//Print when things don't go right
function dataError(e){
    console.log("An error occurred");
}
//function handles creating the house when loaded
function foundHouse(e)
{
    let xhr = e.target;

    //console.log(xhr.responseText);
    try{let thing = JSON.parse(xhr.responseText);}
    catch(error)
    {
        dataError();
        return;
    }
    //turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    //Make sure there is a character
    if(obj.length<1){dataError(); return;}

    //Create a house object with the json results
    house = makeHouse(obj.url, obj.name, obj.region, obj.coatOfArms, obj.words, obj.titles, obj.seats, obj.currentLord, obj.heir, obj.overlord, obj.founded, obj.founder, obj.diedOut, obj.ancestralWeapons, obj.cadetBranches, obj.swornMembers);

    //call fucntions to fill url info
    if(house.currentLord){searchChar("currentLord");}
    if(house.heir){searchChar("heir");}
    if(house.overlord){searchHouses("overlord");}
    if(house.founder){searchChar("founder");}
    if(house.cadetBranches.length>0){searchHouses("cadetBranches");}
    if(house.swornMembers.length>0){searchMembers();}
}

//function fills the character variables with LinkedName object
function searchChar(who)
{
    if(who=="currentLord")
    {
        collectCharacter(house.currentLord, who);
    }
    else if(who=="heir")
    {
        collectCharacter(house.heir, who);
    }
    else if(who=="founder")
    {
        collectCharacter(house.founder, who);
    }
}
//function fills cadetBranches with houses
function searchHouses(who)
{
    if(who=="cadetBranches")
    {
        for(let family of house.cadetBranches)
        {
            collectHouse(family, who);
        }
    }
    else if(who=="overlord")
    {
        collectHouse(house.overlord, who);
    }
}
//function fills swornMembers with characters
function searchMembers()
{
    for(let member of house.swornMembers)
    {
        collectMember(member);
    }
}

//get character from new search
function collectCharacter(url, who)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();

    //set unique onload handler for each "who"
    if(who=="currentLord")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);;
            //create lord object
            currentLord = makeLinkedName(obj.name, obj.url, "characters.html");
            //call check to print before you print out the info
            checkToMakePopUp();
        }
    }
    else if(who=="heir")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create heir object
            heir = makeLinkedName(obj.name, obj.url, "characters.html");
            //call check to print before you print out the info
            checkToMakePopUp();
        }
    }
    else if(who=="founder")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create founder object
            founder = makeLinkedName(obj.name, obj.url, "characters.html");
            //call check to print before you print out the info
            checkToMakePopUp();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}
//get house and add it to cadetMembers list or overlord
function collectHouse(url, who)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();
    if(who=="cadetBranches")
    {
        xhr.onload = houseLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create house object
            let house = makeLinkedName(obj.name, obj.url, "houses.html");
            cadetBranches.push(house);
            checkToMakePopUp();
        }
    }
    else if(who=="overlord")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create overlord object
            overlord = makeLinkedName(obj.name, obj.url, "houses.html");
            //call check to print before you print out the info
            checkToMakePopUp();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}
//get character and add it to member list
function collectMember(url)
{
    //create new XHR object
    let xhr = new XMLHttpRequest();
    xhr.onload = memberLoaded = (e) =>
    {
        xhr = e.target;
        //turn the text into a parsable JavaScript object
        let obj = JSON.parse(xhr.responseText);
        //create character object
        let member = makeLinkedName(obj.name, obj.url, "characters.html");
        swornMembers.push(member);
        checkToMakePopUp();
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function checks if everything is in order to make the popup section on the bottom of the page
function checkToMakePopUp()
{
    if(((currentLord.name.length>0 && house.currentLord.length>0)||(currentLord.name.length<1&&house.currentLord.length<1))&&
        ((heir.name.length>0 && house.heir.length>0)||(heir.name.length<1&&house.heir.length<1)) &&
        ((founder.name.length>0 && house.founder.length>0)||(founder.name.length<1&&house.founder.length<1)) &&
        ((overlord.name.length>0 && house.overlord.length>0)||(overlord.name.length<1&&house.overlord.length<1)) &&
        cadetBranches.length==house.cadetBranches.length &&
        swornMembers.length==house.swornMembers.length)
    {
        createPopUp();
    }
}
//function creates a popup window with information about the clicked house on the bottom of the page
function createPopUp()
{
    //create a section to hold things in
    let section = document.createElement("section");
    //create a header for the section (name of the house)
    let heading = document.createElement("h1");
    heading.innerHTML = `${house.name}`;
    heading.id = "name";
    heading.style.gridArea = "1/1/3/2";
    let pride = document.createElement("div");
    pride.id = "pride";
    pride.style.gridArea = "1/2/3/3";
    let coatOfArms = document.createElement("img");
    coatOfArms.id = "sigil";
    coatOfArms.src=sigil;
    coatOfArms.alt="Coat of Arms";
    coatOfArms.style.width = "200px";
    coatOfArms.style.height = "200px";
    coatOfArms.style.gridArea = "1/2/2/3";
    if(house["words"]){
    let words = document.createElement("p");
    words.id = "words";
    let houseWords
    houseWords = document.createTextNode(house["words"]);
    words.appendChild(houseWords);
    pride.appendChild(words);}
    section.appendChild(heading);
    pride.appendChild(coatOfArms);
    section.appendChild(pride);
    leftRow = 3;
    rightRow=3;
    for(let key in house)
    {
        if(key=="name"||key=="url"||key=="coatOfArms"||key=="words"){continue;}
        if(!house[key]||house[key].length<1||house[key][0].length<1){continue;}
        else if(key=="region")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`Hailing from ${house[key]}`));
            section.appendChild(item);
        }
        else if((key=="titles"&&house[key].length>1) || 
                 key=="seats"&&house[key].length>1)
        {
            let titleList = document.createElement("ul");
            titleList.id=key;
            titleList.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            titleList.appendChild(document.createTextNode(`${keyEdit}:`))
            for(let title of house[key])
            {
                let titleItem = document.createElement("li");
                titleItem.innerHTML = title;
                titleList.appendChild(titleItem);
            }
            section.appendChild(titleList);
        }
        else if(key=="currentLord")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            keyEdit = keyEdit.substring(0,7) + " " + keyEdit.substring(7, 11);
            item.appendChild(document.createTextNode(`${keyEdit}: `));
            let link = document.createElement("a");
            link.href = currentLord.target;
            link.target = "_blank";
            link.innerHTML = currentLord.name;
            link.dataset.who = key;
            item.appendChild(link);
            item.className = "charRef";
            section.appendChild(item);
        }
        else if(key=="heir")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`${keyEdit}: `));
            let link = document.createElement("a");
            link.href = heir.target;
            link.target = "_blank";
            link.innerHTML = heir.name;
            link.dataset.who = key;
            item.appendChild(link);
            item.className = "charRef";
            section.appendChild(item);
        }
        else if(key=="overlord")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`${keyEdit}: `));
            let link = document.createElement("a");
            link.href = overlord.target;
            link.target = "_blank";
            link.innerHTML = overlord.name;
            link.dataset.who = key;
            item.appendChild(link);
            item.className = "houseRef";
            section.appendChild(item);
        }
        else if(key=="founder")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`${keyEdit}: `));
            let link = document.createElement("a");
            link.href = founder.target;
            link.target = "_blank";
            link.innerHTML = founder.name;
            link.dataset.who = key;
            item.appendChild(link);
            item.className = "charRef";
            section.appendChild(item);
        }
        else if(key=="cadetBranches")
        {
            let cadetList = document.createElement("ul");
            cadetList.id = key;
            cadetList.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            keyEdit = keyEdit.substring(0,5) + " " + keyEdit.substring(5,13);
            cadetList.appendChild(document.createTextNode(`${keyEdit}:`))
            for(let cadet of cadetBranches)
            {
                let member = document.createElement("li");
                let link = document.createElement("a");
                link.href = cadet.target;
                link.target = "_blank";
                link.innerHTML = cadet.name;
                link.dataset.list = key;
                link.dataset.index = cadetBranches.indexOf(cadet);
                link.className = "houseRef";
                member.appendChild(link);
                cadetList.appendChild(member);
            }
            section.appendChild(cadetList);
        }
        else if(key=="ancestralWeapons")
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`Ancestral Weapons: ${house[key]}`));
            section.appendChild(item);
        }
        else if((key=="swornMembers"/*&&house[key].length>1*/)){}
        else
        {
            let item = document.createElement("h3");
            item.id=key;
            item.style.gridArea = `${leftRow}/1/${leftRow+1}/2`;
            leftRow=leftRow+1;
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            item.appendChild(document.createTextNode(`${keyEdit}: ${house[key]}`));
            section.appendChild(item);
        }
        //Fortmatted so sworn members is in right column
        if(key=="swornMembers")
        {
            let sworn = document.createElement("div");
            sworn.id = key;
            sworn.style.gridArea = `${rightRow}/2/${leftRow}/3`;
            sworn.style.overflow = "visible";
            let title = document.createElement("h3");
            title.appendChild(document.createTextNode(`Sworn Members of ${house["name"]}`));
            sworn.appendChild(title);
            let memberList = document.createElement("ul");
            let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
            keyEdit = keyEdit.substring(0, 5) + " " + keyEdit.substring(5,12);
            memberList.style.cssText = 'columns:2;'
            for(let member of swornMembers)
            {
                let person = document.createElement("li");
                let link = document.createElement("a");
                link.href = member.target;
                link.target = "_blank";
                link.innerHTML = member.name;
                link.className = "charRef";
                link.dataset.list = key;
                link.dataset.index = swornMembers.indexOf(member);
                person.appendChild(link);
                memberList.appendChild(person);
            }
            sworn.appendChild(memberList);
            section.appendChild(sworn);
        }
    }
    section.style.gridTemplateRows = `220px 50px repeat(${leftRow-3}, 125px)`;
    if(mapOf=="essos"){
        section.style.width="974px";
        section.style.gridTemplateColumns = "500px 500px";
        section.style.gridTemplateRows = `220px 50px repeat(${leftRow-2}, 125px)`;}
    //section.appendChild(list);
    document.body.insertBefore(section, document.querySelector("footer"));
    //remove margin between map and section
    document.querySelector("#map").style.marginBottom = "0";
    //make linked characters go to their page
    assignPopupHandlers();
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
}

//create the elements that hold the house crests and will become the buttons
function createHouses()
{
    let map = document.querySelector("#map");
    let addition;
    switch(mapOf)
    {
        case "north-westeros":
            //Houses: bolton, stark, manderly
            addition = `${map.innerHTML}<img id="bolton" data-url="https://anapioficeandfire.com/api/houses/34" src="media/houses/House-Bolton-Main-Shield.PNG.png" alt="crest of house bolton">
            <img id="manderly" data-url="https://anapioficeandfire.com/api/houses/255" src="media/houses/House-Manderly-Main-Shield.PNG.png" alt="crest of house manderly">
            <img id="stark" data-url="https://anapioficeandfire.com/api/houses/362" src="media/houses/House-Stark-Main-Shield.PNG.png" alt="crest of house stark">`;
            map.innerHTML = addition;
            break;
        case "central-westeros":
            //Houses: arryn, baelish, baratheonD, baratheon, bolton, frey, greyjoy, lannister, maderly, stark, tully
            addition = `${map.innerHTML}<img id="arryn" data-url="https://anapioficeandfire.com/api/houses/7" src="media/houses/House-Arryn-Main-Shield.PNG.png" alt="crest of house Arryn">
            <img id="baelish" data-url="https://anapioficeandfire.com/api/houses/10" src="media/houses/House-Baelish-Main-Shield.PNG.png" alt="crest of house baelish">
            <img id="baratheonD" data-url="https://anapioficeandfire.com/api/houses/15" src="media/houses/House-Baratheon-of-Dragonstone-Main-Shield.PNG.png" alt="crest of house baratheon of dragonstone">
            <img id="baratheon" data-url="https://anapioficeandfire.com/api/houses/16" src="media/houses/House-Baratheon-Main-Shield.PNG.png" alt="crest of house baratheon">
            <img id="bolton" data-url="https://anapioficeandfire.com/api/houses/34" src="media/houses/House-Bolton-Main-Shield.PNG.png" alt="crest of house bolton">
            <img id="frey" data-url="https://anapioficeandfire.com/api/houses/143" src="media/houses/House-Frey-Main-Shield.PNG.png" alt="crest of house frey">
            <img id="greyjoy" data-url="https://anapioficeandfire.com/api/houses/169" src="media/houses/House-Greyjoy-Main-Shield.PNG.png" alt="crest of house Greyjoy">
            <img id="lannister" data-url="https://anapioficeandfire.com/api/houses/229" src="media/houses/House-Lannister-Main-Shield.PNG.png" alt="crest of house lannister">
            <img id="manderly" data-url="https://anapioficeandfire.com/api/houses/255" src="media/houses/House-Manderly-Main-Shield.PNG.png" alt="crest of house manderly">
            <img id="stark" data-url="https://anapioficeandfire.com/api/houses/362" src="media/houses/House-Stark-Main-Shield.PNG.png" alt="crest of house stark">
            <img id="tully" data-url="https://anapioficeandfire.com/api/houses/395" src="media/houses/House-Tully-Main-Shield.PNG.png" alt="crest of house tully">`;
            map.innerHTML = addition;
            break;
        case "south-westeros":
            //Houses: baelish, baratheonD, baratheon, greyjoy, lannister, martell, tully, tyrell
            addition = `${map.innerHTML}<img id="baelish" data-url="https://anapioficeandfire.com/api/houses/10" src="media/houses/House-Baelish-Main-Shield.PNG.png" alt="crest of house baelish">
            <img id="baratheonD" data-url="https://anapioficeandfire.com/api/houses/15" src="media/houses/House-Baratheon-of-Dragonstone-Main-Shield.PNG.png" alt="crest of house baratheon of dragonstone">
            <img id="baratheon" data-url="https://anapioficeandfire.com/api/houses/16" src="media/houses/House-Baratheon-Main-Shield.PNG.png" alt="crest of house baratheon">
            <img id="greyjoy" data-url="https://anapioficeandfire.com/api/houses/169" src="media/houses/House-Greyjoy-Main-Shield.PNG.png" alt="crest of house Greyjoy">
            <img id="lannister" data-url="https://anapioficeandfire.com/api/houses/229" src="media/houses/House-Lannister-Main-Shield.PNG.png" alt="crest of house lannister">
            <img id="martell" data-url="https://anapioficeandfire.com/api/houses/285" src="media/houses/House-Martell-Main-Shield.PNG.png" alt="crest of house martell">
            <img id="tully" data-url="https://anapioficeandfire.com/api/houses/395" src="media/houses/House-Tully-Main-Shield.PNG.png" alt="crest of house tully">
            <img id="tyrell" data-url="https://anapioficeandfire.com/api/houses/398" src="media/houses/House-Tyrell-Main-Shield.PNG.png" alt="crest of house tyrell">`;
            map.innerHTML = addition;
            break;
        case "essos":
            //Houses: targaryen
            addition = `${map.innerHTML}<img id="targaryen" data-url="https://anapioficeandfire.com/api/houses/378" src="media/houses/House-Targaryen-Main-Shield.PNG.png" alt="crest of house targaryen">`;
            map.innerHTML = addition;
            break;
    }
}

//function to have the crests appear at the correct coordinates
function placeHouses()
{
    let bolton = document.querySelector("#bolton");
    let stark = document.querySelector("#stark");
    let manderly = document.querySelector("#manderly");
    let arryn = document.querySelector("#arryn");
    let baelish = document.querySelector("#baelish");
    let baratheonD = document.querySelector("#baratheonD");
    let baratheon = document.querySelector("#baratheon");
    let frey = document.querySelector("#frey");
    let greyjoy = document.querySelector("#greyjoy");
    let lannister = document.querySelector("#lannister");
    let tully = document.querySelector("#tully");
    let martell = document.querySelector("#martell");
    let tyrell = document.querySelector("#tyrell");
    let targaryen = document.querySelector("#targaryen");
    switch(mapOf)
    {
        case "north-westeros":
            //Houses: bolton, stark, manderly
            // let bolton = document.querySelector("#bolton");
            bolton.style.top = "465px";
            bolton.style.left = "508px";
            // let stark = document.querySelector("#stark");
            stark.style.top = "494px";
            stark.style.left = "347px";
            // let manderly = document.querySelector("#manderly");
            manderly.style.top = "642px";
            manderly.style.left = "437px";
            break;
        case "central-westeros":
            //Houses: arryn, baelish, baratheonD, baratheon, bolton, frey, greyjoy, lannister, maderly, stark, tully
            // let arryn = document.querySelector("#arryn");
            arryn.style.top = "490px";
            arryn.style.left = "517px";
            // let baelish = document.querySelector("#baelish");
            baelish.style.top = "590px";
            baelish.style.left = "420px";
            // let baratheonD = document.querySelector("#baratheonD");
            baratheonD.style.top = "645px";
            baratheonD.style.left = "630px";
            // let baratheon = document.querySelector("#baratheon");
            baratheon.style.top = "725px";
            baratheon.style.left = "490px";
            baratheon.style.width = "25px";
            baratheon.style.height = "25px";
            // bolton = document.querySelector("#bolton");
            bolton.style.top = "55px";
            bolton.style.left = "508px";
            // let frey = document.querySelector("#frey");
            frey.style.top = "429px";
            frey.style.left = "325px";
            // let greyjoy = document.querySelector("#greyjoy");
            greyjoy.style.top = "502px";
            greyjoy.style.left = "135px";
            // let lannister = document.querySelector("#lannister");
            lannister.style.top = "659px";
            lannister.style.left = "125px";
            // manderly = document.querySelector("#manderly");
            manderly.style.top = "235px";
            manderly.style.left = "437px";
            // stark = document.querySelector("#stark");
            stark.style.top = "85px";
            stark.style.left = "347px";
            // let tully = document.querySelector("#tully");
            tully.style.top = "556px";
            tully.style.left = "310px";
            break;
        case "south-westeros":
            //Houses: baelish, baratheonD, baratheon, greyjoy, lannister, martell, tully, tyrell
            // baelish = document.querySelector("#baelish");
            baelish.style.top = "95px";
            baelish.style.left = "420px";
            // baratheonD = document.querySelector("#baratheonD");
            baratheonD.style.top = "147px";
            baratheonD.style.left = "632px";
            // baratheon = document.querySelector("#baratheon");
            baratheon.style.top = "228px";
            baratheon.style.left = "485px";
            baratheon.style.width = "40px";
            baratheon.style.height = "40px";
            // greyjoy = document.querySelector("#greyjoy");
            greyjoy.style.top = "8px";
            greyjoy.style.left = "135px";
            // lannister = document.querySelector("#lannister");
            lannister.style.top = "165px";
            lannister.style.left = "125px";
            // let martell = document.querySelector("#martell");
            martell.style.top = "598px";
            martell.style.left = "619px";
            // tully = document.querySelector("#tully");
            tully.style.top = "60px";
            tully.style.left = "310px";
            // let tyrell = document.querySelector("#tyrell");
            tyrell.style.top = "410px";
            tyrell.style.left = "208px";
            break;
        case "essos":
            // let targaryen = document.querySelector("#targaryen");
            targaryen.style.top = "400px";
            targaryen.style.left = "350px";
            break;
    }
}
//destroy imgs to be recreated
function destroyHouses()
{
    let map = document.querySelectorAll("#map img");
    for(let img of map)
    {
        img.remove();
    }
    let img = document.createElement("img");
    img.id = "mapImg";
    img.src="";
    img.alt="map of westeros or essos";
    document.querySelector("#map").appendChild(img);
}

//Assigns a specific map to a specific button
function changeMap(e)
{
    //delete the current popup if there is one
    let popup = document.querySelector("section");
    if(popup){popup.remove();}

    //set general prefix for the maps
    let prefix = "./media/julio-lacerda";
    

    let file = e.target.innerHTML;
    //trim
    file = file.toLowerCase().replace(/ /g,'-');
    //tell page what map is being displayed
    mapOf = file;
    
    file = `${file}.jpeg`;
    let address = `${prefix}/${file}`;
    let map = document.querySelector("#map");
    destroyHouses();
    let img = document.querySelector("#mapImg");
    map.style.width = "750px";
    img.style.width = "750px";
    if(file=="essos.jpeg")
    {
        map.style.width = "1000px";
        img.style.width = "1000px";
    }
    img.onload = (e) => {
    createHouses();
    placeHouses();
    assignHouseButtons();}
    img.src = address;
}

//Add click handler to every link to make it so they can send to proper page
function assignPopupHandlers()
{
    //select all classed elements
    let charRefs = document.querySelectorAll(".charRef");
    let houseRefs = document.querySelectorAll(".houseRef");
    //Add event listeners to all selected elements
    for(let element of charRefs)
    {
        element.addEventListener("click", sendCharacterH);
    }
    for(let element of houseRefs)
    {
        element.addEventListener("click", sendHouseH);
    }
}

//function to send character to local storage
function sendCharacterH(e)
{
    //convert to json format
    let jsonChar;
    if(e.target.dataset.who=="currentLord")
    {
        jsonChar = JSON.stringify(currentLord);
    }
    else if(e.target.dataset.who=="heir")
    {
        jsonChar = JSON.stringify(heir);
    }
    else if(e.target.dataset.who=="founder")
    {
        jsonChar = JSON.stringify(founder);
    }
    else if(e.target.dataset.list=="swornMembers")
    {
        jsonChar = JSON.stringify(swornMembers[e.target.dataset.index]);
    }
    //send to local storage
    localStorage.setItem(charSearchKey, jsonChar);
    
}
//function to send house to local storage
function sendHouseH(e)
{
    //convert to json form
    let jsonHouse;
    if(e.target.dataset.who=="overlord")
    {
        jsonHouse = JSON.stringify(overlord);
    }
    else if(e.target.dataset.list = "cadetBranches")
    {
        jsonHouse = JSON.stringify(cadetBranches[e.target.dataset.index]);
    }
    //send to local storage
    localStorage.setItem(houseSearchKey, jsonHouse);
}

//OBJECT FACTORIES
//Function to make house objects
function makeHouse(url, name, region, coatOfArms, words, titles, seats, currentLord, heir, overlord, founded, founder, diedOut, ancestralWeapons, cadetBranches, swornMembers)
{
    let house = {
        url: url,
        name: name,
        region: region,
        coatOfArms: coatOfArms,
        words: words,
        titles: titles,
        seats: seats,
        currentLord: currentLord,
        heir: heir,
        overlord: overlord,
        founded: founded,
        founder: founder,
        diedOut: diedOut,
        ancestralWeapons: ancestralWeapons,
        cadetBranches: cadetBranches,
        swornMembers: swornMembers
    }
    Object.seal(house);
    return house;
}
//creates an object that has a name and a url
function makeLinkedName(name="", url="", target="")
{
    let object = {
        name: name,
        url: url,
        target: target
    }
    Object.seal(object);
    return object;
}