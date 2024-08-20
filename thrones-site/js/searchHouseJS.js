window.onload = (e) => {
    document.querySelector("#search").addEventListener("click", searchButtonClicked3);
    document.querySelector("#clear").addEventListener("click", clearButtonClicked3);
    if(storedHouseSearch)
    {
        //disable button and input until the page loads
        document.querySelector("#search").disabled = true;
        document.querySelector("#searchterm").disabled = true;
        //parse into object again
        let storedHouse = JSON.parse(storedHouseSearch);
        displayTerm = storedHouse.name;
        getData3(storedHouse.url);
        localStorage.removeItem(houseSearchKey);
    }
    if(lastSearchedHouse){lastSearchedHouseCreate();}
}
//variables for controlling local storage
const prefix = "nca6109-";
const charSearchKey = prefix+"charSearch";
const houseSearchKey = prefix+"houseSearch";
const booksSearchKey = prefix+"booksSearch";
const lastSearchedHouseKey = prefix+"lastHouse";

//Sent objects to be opened immediately
const storedcharSearch = localStorage.getItem(charSearchKey);
const storedHouseSearch = localStorage.getItem(houseSearchKey);
const storedBooksSearch = localStorage.getItem(booksSearchKey);
//Last searched object
let lastSearchedHouse = localStorage.getItem(lastSearchedHouseKey);

//general link to api book library
const API_Houses = "https://anapioficeandfire.com/api/houses/";

//variable determines how we'll search
let howSearch;
let page=1;
//save drop value when selected so we don't need to freeze it
let dropValue;

let displayTerm="";
let house;
//literals and arrays to hold data that requires additional AJAX
const houses=[];
let currentLord=makeLinkedName();
let heir=makeLinkedName();
let overlord=makeLinkedName();
let founder=makeLinkedName();
const cadetBranches = [];
const swornMembers = [];

//Creates the last searched button if there was one
function lastSearchedHouseCreate()
{
    //parse JSON into an object
    let storedHouse = JSON.parse(lastSearchedHouse);
    //get div where last search is displayed
    let lastSearch = document.querySelector("#last");
    //clear lastSearch
    lastSearch.innerHTML="";
    lastSearch.appendChild(document.createTextNode("Last Search: "));
    let link = document.createElement("span");
    link.innerHTML = storedHouse.name;
    link.dataset.url = storedHouse.url;
    link.style.textDecoration = "underline";
    lastSearch.appendChild(link);

    lastSearch.addEventListener("click", lastClicked = (e) =>{
        //disable button and input until the page loads
        document.querySelector("#search").disabled = true;
        document.querySelector("#searchterm").disabled = true;
        document.querySelector("#box").disabled = true;
        //remove info from prior search
        document.querySelector("section").innerHTML = "";
        document.querySelector("section").className = "";
        //search for last searched and display
        getData3(e.target.dataset.url);
        //Update the new last searched house
        if(lastSearchedHouse){lastSearchedHouseCreate();}
        document.querySelector("#status").innerHTML = "Searching...";
    })
}
//Starts the search when button is clicked and the button and input will be disabled until the search is completed
function searchButtonClicked3()
{
    //disable button and input until the page loads
    document.querySelector("#search").disabled = true;
    document.querySelector("#searchterm").disabled = true;
    document.querySelector("#box").disabled = true;

    //remove info from prior search
    document.querySelector("section").innerHTML = "";
    document.querySelector("section").className = "";
    //reset page num to 1
    page=1;

    //Update the new last searched house
    if(lastSearchedHouse){lastSearchedHouseCreate();}

    //Run function to check input contents to see what will be searched for
    let term = whichSearchHouse();
    if(!term)
    {
        document.querySelector("#status").innerHTML = "Enter search criteria...";
        //Re=enable buttons
        document.querySelector("#search").disabled = false;
        document.querySelector("#searchterm").disabled = false;
        document.querySelector("#box").disabled = false;
        return;
    }
    displayTerm = term;
    let termEdit = term.replace(/ /g,'+');
    //check if term is a number and search based on that instead of name
    if(howSearch=="browse")
    {
        let URL = `${API_Houses}?page=${page}`;
        getPage3(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else if(howSearch=="byRegion")
    {
        dropValue = document.querySelector("#regionDrop").value;
        let URL = `${API_Houses}?region=${dropValue}&page=${page}`;
        getPage3(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else if(howSearch=="bySearch")
    {
        if(!isNaN(term))
        {
            //make URL
            let URL = `${API_Houses}${termEdit}`;
            getData3(URL);
        }
        else
        {
            //make URL
            let URL = `${API_Houses}?name=${termEdit}`;
            getData3(URL);
        }
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else
    {
        document.querySelector("#status").innerHTML = "Enter search criteria...";
    }
}

//Function clears the contents of the search controls
function clearButtonClicked3(e)
{
    let bar = document.querySelector("#searchterm");
    let drop = document.querySelector("#regionDrop");
    let all = document.querySelector("#box");

    bar.value = null;
    drop.selectedIndex = 0;
    all.checked = false;
}

//Function returns the value that will be the search term and changes what search mode the page is in
function whichSearchHouse()
{
    let searchBar = document.querySelector("#searchterm");
    let regionDrop = document.querySelector("#regionDrop");
    let checkBrowse = document.querySelector("#box");

    if(checkBrowse.checked)
    {
        howSearch = "browse";
        return "Just Browsing";
    }
    else if(regionDrop.value!="none")
    {
        howSearch = "byRegion";
        return regionDrop.value;
    }
    else if(searchBar.value)
    {
        howSearch = "bySearch";
        return searchBar.value;
    }
    else
    {
        howSearch = "none";
        return;
    }
}

//function to get data from API
function getData3(url){
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
    xhr.onload = houseLoaded1;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//Function to get a whole page as the JSON item
function getPage3(url){
    //Clear houses
    houses.splice(0,houses.length);

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = pageLoaded3;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//Callback Functions

//Print when things don't go right
function dataError(e){
    console.log("An error occurred");
    document.querySelector("section").innerHTML="";
    document.querySelector("#status").innerHTML = `No results found for ${displayTerm}`;
    //re-enable the input and button
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;
}

//Load the initial JSON from API and make an object from info in it
function houseLoaded1(e)
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

    //Make sure there is a house
    if(obj.length<1){dataError(); return;}

    //Name search will return array of characters with input name, use first result
    if(obj[0])
    {
        house = makeHouse(obj[0].url, obj[0].name, obj[0].region, obj[0].coatOfArms, obj[0].words, obj[0].titles, obj[0].seats, obj[0].currentLord, obj[0].heir, obj[0].overlord, obj[0].founded, obj[0].founder, obj[0].diedOut, obj[0].ancestralWeapons, obj[0].cadetBranches, obj[0].swornMembers);
    }
    else
    {
        house = makeHouse(obj.url, obj.name, obj.region, obj.coatOfArms, obj.words, obj.titles, obj.seats, obj.currentLord, obj.heir, obj.overlord, obj.founded, obj.founder, obj.diedOut, obj.ancestralWeapons, obj.cadetBranches, obj.swornMembers);
    }

    //call fucntions to fill url info
    if(house.currentLord){findCharacter("currentLord");}
    if(house.heir){findCharacter("heir");}
    if(house.overlord){findHouses("overlord");}
    if(house.founder){findCharacter("founder");}
    if(house.cadetBranches.length>0){findHouses("cadetBranches");}
    if(house.swornMembers.length>0){findMembers();}

    //Send the hosue to local storage for being the last on searched
    sendLastHouse(house);
}

//Load JSON from API when in browsing mode
function pageLoaded3(e){
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

    //fill houses with objects created from json obj
    for(let house of obj)
    {
        let newHouse = makeHouse(house.url, house.name, house.region, house.coatOfArms, house.words, house.titles, house.seats, house.currentLord, house.heir, house.overlord, house.founded, house.founder, house.diedOut, house.ancestralWeapons, house.cadetBranches, house.swornMembers);
        houses.push(newHouse);
    }

    //call function to create browsing page
    printHouseBrowsing();
}

//function fills the character variables with LinkedName object
function findCharacter(who)
{
    if(who=="currentLord")
    {
        getCharacter(house.currentLord, who);
    }
    else if(who=="heir")
    {
        getCharacter(house.heir, who);
    }
    else if(who=="founder")
    {
        getCharacter(house.founder, who);
    }
}

//function fills cadetBranches with houses
function findHouses(who)
{
    if(who=="cadetBranches")
    {
        for(let family of house.cadetBranches)
        {
            getHouse(family, who);
        }
    }
    else if(who=="overlord")
    {
        getHouse(house.overlord, who);
    }
}
//function fills swornMembers with characters
function findMembers()
{
    for(let member of house.swornMembers)
    {
        getMember(member);
    }
}

function getCharacter(url, who)
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
            let lord = makeLinkedName(obj.name, obj.url, "characters.html");
            currentLord = lord;
            //call check to print before you print out the info
            checkToPrintHouse();
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
            let nextOne = makeLinkedName(obj.name, obj.url, "characters.html");
            heir = nextOne;
            //call check to print before you print out the info
            checkToPrintHouse();
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
            let founderGuy = makeLinkedName(obj.name, obj.url, "characters.html");
            founder = founderGuy;
            //call check to print before you print out the info
            checkToPrintHouse();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}
//get house and add it to cadetMembers list
function getHouse(url, who)
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
            checkToPrintHouse();
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
            let over = makeLinkedName(obj.name, obj.url, "houses.html");
            overlord = over;
            //call check to print before you print out the info
            checkToPrintHouse();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}
//get character and add it to member list
function getMember(url)
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
        checkToPrintHouse();
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function to check if info is ready to be printed, if it is, print
function checkToPrintHouse()
{
    if(((currentLord.name.length>0 && house.currentLord.length>0)||(currentLord.name.length<1&&house.currentLord.length<1))&&
        ((heir.name.length>0 && house.heir.length>0)||(heir.name.length<1&&house.heir.length<1)) &&
        ((founder.name.length>0 && house.founder.length>0)||(founder.name.length<1&&house.founder.length<1)) &&
        ((overlord.name.length>0 && house.overlord.length>0)||(overlord.name.length<1&&house.overlord.length<1)) &&
        cadetBranches.length==house.cadetBranches.length &&
        swornMembers.length==house.swornMembers.length)
    {
        printHouse();
    }
}
//Print out the info about the house
function printHouse()
{
    //get section to add to
    let section = document.querySelector("section");
    let line = `<h1>${house["name"]}</h1><ul>`;
    for(let key in house)
    {
        //add special cases in their own formats
        if(!house[key]||!house[key][0])
        {
            continue;
        }
        if(key=="name"){continue;}
        if(key=="url"){continue;}
        let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
        let addition = `<li>${keyEdit}: `;
        if((key=="titles"&&house[key].length>1) || 
                 key=="seats"&&house[key].length>1)
        {
            addition = `<li><ul>${keyEdit}:`;
            for(let title of house[key])
            {
                addition = `${addition}<li>${title}</li>`;
            }
            addition=`${addition}</ul>`;
        }
        else if(key=="currentLord")
        {
            addition = `${addition}<a href="${currentLord.target}" class="charRef" data-who="currentLord">${currentLord.name}</a>`;
        }
        else if(key=="heir")
        {
            addition = `${addition}<a href="${heir.target}" class="charRef" data-who="heir">${heir.name}</a>`;
        }
        else if(key=="overlord")
        {
            addition = `${addition}<a href="${overlord.target}" class="houseRef" data-who="overlord">${overlord.name}</a>`;
        }
        else if(key=="founder")
        {
            addition = `${addition}<a href="${founder.target}" class="charRef" data-who="founder">${founder.name}</a>`;
        }
        else if(key=="cadetBranches")
        {
            addition = `${addition}<ul id="cadetBranches">`;
            for(let branch of cadetBranches)
            {
                addition = `${addition}<li><a href="${branch.target}" class="houseRef" data-index="${cadetBranches.indexOf(branch)}" data-list="cadetBranches">${branch.name}</a></li>`;
            }
            addition = `${addition}</ul>`;
        }
        else if(key=="swornMembers")
        {
            addition = `${addition}<ul id="swornMembers">`;
            for(let member of swornMembers)
            {
                addition = `${addition}<li><a href="${member.target}" class="charRef" data-index="${swornMembers.indexOf(member)}" data-list="swornMembers">${member.name}</a></li>`
            }
        }
        else
        {
            addition = `<li>${keyEdit}: ${house[key]}</li>`;
        }
        line = `${line}${addition}</li>`;
    }
    line = `${line}</ul>`;
    //Add the new section into the content section
    section.innerHTML = line;
    document.querySelector("section").className = "fullResult";

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + " </i></p>";

    assignHouseHandlers();
    //Scroll to new item
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
      
    //re-enable the input and button
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;
}

//Add click handler to every link to make it so they can send to proper page
function assignHouseHandlers()
{
    //select all classed elements
    let charRefs = document.querySelectorAll(".charRef");
    let houseRefs = document.querySelectorAll(".houseRef");
    //Add event listeners to all selected elements
    for(let element of charRefs)
    {
        element.addEventListener("click", sendCharacter3);
    }
    for(let element of houseRefs)
    {
        element.addEventListener("click", sendHouse3);
    }
}

//Function fills the section with houses that can hyperlink to their full information and has the next page buttons
function printHouseBrowsing()
{
    //Clear the section if it is full
    document.querySelector("section").innerHTML = "";

    let section = document.querySelector("section");
    let heading = document.createElement("h1");
    heading.innerHTML = `Viewing Page ${page} of Houses`;
    heading.style.color = "#020202";
    section.appendChild(heading);
    let list = document.createElement("ul");
    list.className = "browseList";
    list.id = "houseList";
    for(let house of houses)
    {
        let item = document.createElement("li");
        item.className = "selfRef";
        let div = document.createElement("div");
        div.className = "resultDiv";
        let name = document.createElement("h2");
        name.style.color = "#CA9645";
        name.innerHTML = house.name;
        div.appendChild(name);
        let region = document.createElement("p");
        region.className = "houseRegion";
        region.innerHTML= `Region: ${house.region}`;
        div.appendChild(region);
        let words = document.createElement("p");
        words.id = "allWords";
        words.innerHTML = house.words;
        div.appendChild(words);
        let link = document.createElement("a");
        link.href = "houses.html";
        link.target = "_blank";
        link.dataset.url = house.url;
        link.innerHTML = `See more about ${house.name}`;
        div.appendChild(link);
        item.appendChild(div);
        list.appendChild(item);
    }
    list.style.columns = "2";
    section.appendChild(list);
    //Create buttons that will advance or go back a page
    let prev = document.createElement("button");
    prev.type = "button";
    prev.id = "prev";
    prev.innerHTML = "<-Prev";
    let next = document.createElement("button");
    next.type = "button";
    next.id = "next";
    next.innerHTML = "Next->";
    section.appendChild(prev);
    section.appendChild(next);
    //Turn off prev button if there is no previous page
    if(page==1)
    {
        prev.disabled = true;
    }
    checkNextHouse();
    //reable button and input
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + " </i></p>";

    //Assign handlers to all new buttons and links
    assignBrowseHandlersHouse();
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
}

//function to assign click handlers for browse mode
function assignBrowseHandlersHouse(){
    //Assign click handler to hrefs to send character to local for new page
    let refs = document.querySelectorAll(".selfRef");
    for(let ref of refs)
    {
        ref.addEventListener("click", sendHouse3);
    }
    //Make prev and next buttons call next and previous page
    let prev = document.querySelector("#prev");
    prev.addEventListener("click", prevClick = (e)=> {
        page-=1;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Houses}?page=${page}`;
        }
        else if(howSearch=="byRegion")
        {
            URL = `${API_Houses}?region=${dropValue}&page=${page}`;
        }
        getPage3(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
    let next = document.querySelector("#next");
    next.addEventListener("click", prevClick = (e)=> {
        page++;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Houses}?page=${page}`;
        }
        else if(howSearch=="byRegion")
        {
            URL = `${API_Houses}?region=${dropValue}&page=${page}`;
        }
        getPage3(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
}

function checkNextHouse()
{
    let nextPage = page + 1;
    let url;
    if(howSearch=="browse")
    {
        url = `${API_Houses}?page=${nextPage}`;
    }
    else if(howSearch=="byRegion")
    {
        url = `${API_Houses}?region=${dropValue}&page=${nextPage}`;
    }
    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = isNext = (e) => {
        let XHR = e.target;
        if(xhr.responseText=="[]")
        {
            document.querySelector("#next").disabled = true;
            return;
        }
        return;
    };

    // 3 - set the onerror handler
    xhr.onerror = noNext = (e) => {
        document.querySelector("#next").disabled = true;
    };

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function to send character to local storage
function sendCharacter3(e)
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
function sendHouse3(e)
{
    //convert to json form
    let jsonHouse;
    if(e.target.dataset.who=="overlord")
    {
        jsonHouse = JSON.stringify(overlord);
    }
    else if(e.target.dataset.list == "cadetBranches")
    {
        jsonHouse = JSON.stringify(cadetBranches[e.target.dataset.index]);
    }
    else
    {
        let sendHouse = makeLinkedName("", e.target.dataset.url)
        jsonHouse = JSON.stringify(sendHouse);
    }
    //send to local storage
    localStorage.setItem(houseSearchKey, jsonHouse);
}
//function to send the last searched house to local storage
function sendLastHouse(house)
{
    let jsonHouse = JSON.stringify(house);
    localStorage.setItem(lastSearchedHouseKey, jsonHouse);
    lastSearchedHouse = jsonHouse;
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