window.onload = (e) => {
    document.querySelector("#search").addEventListener("click", searchButtonClicked2);
    document.querySelector("#clear").addEventListener("click", clearButtonClicked2);
    document.querySelector("#searchterm").addEventListener("onchange", highlightActive2);
    if(storedCharSearch)
    {
        //disable button and input until the page loads
        document.querySelector("#search").disabled = true;
        document.querySelector("#searchterm").disabled = true;
        document.querySelector("#box").disabled = true;
        //parse into object again
        let storedCharacter = JSON.parse(storedCharSearch);
        displayTerm = storedCharacter.name;
        getData2(storedCharacter.url);
        //remove autosearch character from local storage
        localStorage.removeItem(charSearchKey);
    }
    if(lastSearchedChar){lastSearchedCharCreate();}
}
//variables for controlling local storage
const prefix = "nca6109-";
const charSearchKey = prefix+"charSearch";
const houseSearchKey = prefix+"houseSearch";
const booksSearchKey = prefix+"booksSearch";
const lastSearchedCharKey = prefix+"lastCharacter";

const storedCharSearch = localStorage.getItem(charSearchKey);
const storedHouseSearch = localStorage.getItem(houseSearchKey);
const storedBooksSearch = localStorage.getItem(booksSearchKey);
//Last searched character
let lastSearchedChar = localStorage.getItem(lastSearchedCharKey);

//general link to api character library
const API_Characters = "https://anapioficeandfire.com/api/characters/";

//variable determines how we'll search
let howSearch;
let page=1;
//save drop value when selected so we don't need to freeze it
let dropValue;

let displayTerm = "";
let character;
//literals and arrays to hold data that requires additional AJAX
const characters = [];
let father=makeLinkedName();
let mother=makeLinkedName();
let spouse=makeLinkedName();
const allegiances = [];
const books = [];
const povBooks = [];

//Creates the last searched button if there was one
function lastSearchedCharCreate()
{
    //parse JSON into an object
    let storedChar = JSON.parse(lastSearchedChar);
    //get div where last search is displayed
    let lastSearch = document.querySelector("#last");
    //clear lastSearch
    lastSearch.innerHTML="";
    lastSearch.appendChild(document.createTextNode("Last Search: "));
    let link = document.createElement("span");
    if(!storedChar.name){link.innerHTML = storedChar.aliases[0];}
    else{link.innerHTML = storedChar.name;}
    link.dataset.url = storedChar.url;
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
        getData2(e.target.dataset.url);
        //Update the new last searched character
        if(lastSearchedChar){lastSearchedCharCreate();}
        document.querySelector("#status").innerHTML = "Searching...";
    })
}

//highlights whichever search will be active
function highlightActive2()
{
    let bar = document.querySelector("#searchterm");
    let drop = document.querySelector("#cultureDrop");
    let all = document.querySelector("#box");

    
}

//Starts the search when button is clicked and the button and input will be disabled until the search is completed
function searchButtonClicked2()
{
    //disable button and input until the page loads
    document.querySelector("#search").disabled = true;
    document.querySelector("#searchterm").disabled = true;
    document.querySelector("#box").disabled = true;

    //remove info from prior search
    document.querySelector("section").innerHTML = "";
    document.querySelector("section").className = "";
    page = 1;

    //Update the new last searched character
    if(lastSearchedChar){lastSearchedCharCreate();}

    //Run function to check input contents to see what will be searched for
    let term = whichSearchChar();
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
        let URL = `${API_Characters}?page=${page}`;
        getPage2(URL);
        document.querySelector("#status").innerHTML = "Searching...";
        return;
    }
    else if(howSearch=="byCulture")
    {
        dropValue = document.querySelector("#cultureDrop").value;
        let URL = `${API_Characters}?culture=${dropValue}&page=${page}`;
        getPage2(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else if(howSearch=="bySearch")
    {
        if(!isNaN(term))
        {
            //make URL
            let URL = `${API_Characters}${termEdit}`;
            getData2(URL);
        }
        else
        {
            //make URL
            let URL = `${API_Characters}?name=${termEdit}`;
            getData2(URL);
        }
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else
    {
        document.querySelector("#status").innerHTML = "Enter search criteria...";
    }
}

//Function clears the contents of the search controls
function clearButtonClicked2(e)
{
    let bar = document.querySelector("#searchterm");
    let drop = document.querySelector("#cultureDrop");
    let all = document.querySelector("#box");

    bar.value = null;
    drop.selectedIndex = 0;
    all.checked = false;
}

//Function returns the value that will be the search term and changes what search mode the page is in
function whichSearchChar()
{
    let searchBar = document.querySelector("#searchterm");
    let cultureDrop = document.querySelector("#cultureDrop");
    let checkBrowse = document.querySelector("#box");

    if(checkBrowse.checked)
    {
        howSearch = "browse";
        return "Just Browsing";
    }
    else if(cultureDrop.value!="none")
    {
        howSearch = "byCulture";
        return cultureDrop.value;
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
function getData2(url){
    //clear the values of the gloabal variables
    father=makeLinkedName();
    mother=makeLinkedName();
    spouse=makeLinkedName();
    allegiances.splice(0,allegiances.length);
    books.splice(0,books.length);
    povBooks.splice(0,povBooks.length);

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = characterLoaded;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}
//Function to get a whole page as the JSON item
function getPage2(url){
    //Clear houses
    characters.splice(0,characters.length);

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = pageLoaded2;

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
function characterLoaded(e)
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
    //Name search will return array of characters with input name, use first result
    if(obj[0])
    {
        character = makeCharacter(obj[0].url, obj[0].name, obj[0].gender, obj[0].culture, obj[0].born, obj[0].died, obj[0].titles, obj[0].aliases, obj[0].father, obj[0].mother, obj[0].spouse, obj[0].allegiances, obj[0].books, obj[0].povBooks, obj[0].tvSeries, obj[0].playedBy);
    }
    else
    {
        character = makeCharacter(obj.url, obj.name, obj.gender, obj.culture, obj.born, obj.died, obj.titles, obj.aliases, obj.father, obj.mother, obj.spouse, obj.allegiances, obj.books, obj.povBooks, obj.tvSeries, obj.playedBy);
    }

    //function calls to fill URL info if property is filled
    if(character.father){ findCharacter1("father"); }
    if(character.mother){ findCharacter1("mother"); }
    if(character.spouse){ findCharacter1("spouse"); }
    if(character.allegiances.length>0){ fillAllegiances(); }
    if(character.books.length>0){ fillBooks("all");}
    if(character.povBooks.length>0){ fillBooks("pov"); }

    //store last character
    sendLastChar(character)
}
//Load JSON from API when in browsing mode
function pageLoaded2(e){
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
    for(let person of obj)
    {
        console.log(person);
        let newCharacter = makeCharacter(person.url, person.name, person.gender, person.culture, person.born, person.died, person.titles, person.aliases, person.father, person.mother, person.spouse, person.allegiances, person.books, person.povBooks, person.tvSeries, person.playedBy);
        characters.push(newCharacter);
    }

    //call function to create browsing page
    printCharacterBrowsing();
}

//function fills the family variables with LinkedName object
function findCharacter1(who)
{
    if(who=="father")
    {
        getCharacter1(character.father, who);
    }
    else if(who=="mother")
    {
        getCharacter1(character.mother, who);
    }
    else if(who=="spouse")
    {
        getCharacter1(character.spouse, who);
    }
}

//function calls to add an allegiance to allegiance array
function fillAllegiances()
{
    for(let i=0; i<character.allegiances.length; i++)
    {
        getHouse1(character.allegiances[i])
    }
}

//calls to fill arrays with books
function fillBooks(who)
{
    if(who=="all")
    {
        for(let i=0; i<character.books.length; i++)
        {
            getBook1(character.books[i], who);
        }
    }
    else if(who=="pov")
    {
        for(let i=0; i<character.povBooks.length; i++)
        {
            getBook1(character.povBooks[i], who);
        }
    }
}

//function to put a character into their proper global variable
function getCharacter1(url, who)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();

    //set unique onload handler for each "who"
    if(who=="father")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);;
            //create father object
            let parent = makeLinkedName(obj.name, obj.url, "characters.html");
            father = parent;
            //call check to print before you print out the info
            checkToPrintChar();
        }
    }
    else if(who=="mother")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create mother object
            let parent = makeLinkedName(obj.name, obj.url, "characters.html");
            mother = parent;
            //call check to print before you print out the info
            checkToPrintChar();
        }
    }
    else if(who=="spouse")
    {
        xhr.onload = charLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create spouse object
            let lover = makeLinkedName(obj.name, obj.url, "characters.html");
            spouse = lover;
            checkToPrintChar();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//get house and add it to allegiances list
function getHouse1(url)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();
    xhr.onload = houseLoaded = (e) => 
    {
        xhr = e.target;
        //turn the text into a parsable JavaScript object
        let obj = JSON.parse(xhr.responseText);
        //create hosue object
        let house = makeLinkedName(obj.name, obj.url, "houses.html");
        allegiances.push(house);
        checkToPrintChar();
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//get book and add it to proper book list
function getBook1(url, who)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();

    //set unique onload handler for each "who"
    if(who=="all")
    {
        xhr.onload = anyBookLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create book object
            let book = makeLinkedName(obj.name, obj.url, "books.html");
            books.push(book);
            //call check to print before you print out the info
            checkToPrintChar();
        }
    }
    else if(who=="pov")
    {
        xhr.onload = povBookLoaded = (e) => 
        {
            xhr = e.target;
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //create book object
            let book = makeLinkedName(obj.name, obj.url, "books.html");
            povBooks.push(book);
            //call check to print before you print out the info
            checkToPrintChar();
        }
    }
    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function to check if info is ready to be printed, if it is, print
function checkToPrintChar()
{
    if(((father.name.length>0 && character.father.length>0)||(father.name.length<1&&character.father.   length<1)) && 
        ((mother.name.length>0 && character.mother.length>0)||(mother.name.length<1&&character.mother.length<1)) && 
        ((spouse.name.length>0 && character.spouse.length>0)||(spouse.name.length<1&&character.spouse.length<1)) && 
        allegiances.length==character.allegiances.length &&
        books.length==character.books.length &&
        povBooks.length==character.povBooks.length)
    {
        printCharacter();
    }
}

//function to print character info onto the screen
function printCharacter()
{
    //get section to add to
    let section = document.querySelector("section");
    let line = `<h1>${character["name"]}</h1><ul>`;
    if(!character["name"]){line = `<h1>${character["aliases"][0]}</h1><ul>`;}
    for(let key in character)
    {
        //add special cases in their own formats
        if(!character[key] || !character[key][0]){continue;}
        if(key=="name"){continue;}
        if(key=="url"){continue;}
        let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
        let addition = `<li>${keyEdit}: `;
        if((key=="titles"&&character[key].length>1) || 
                 key=="aliases"&&character[key].length>1 ||
                 key=="tvSeries"&&character[key].length>1)
        {
            addition = `<li><ul>${keyEdit}:`;
            for(let title of character[key])
            {
                addition = `${addition}<li>${title}</li>`;
            }
            addition=`${addition}</ul>`;
        }
        else if(key=="father")
        {
            addition = `${addition}<a href="${father.target}" class="charRef" data-who="father">${father.name}</a>`;
        }
        else if(key=="mother")
        {
            addition = `${addition}<a href="${mother.target}" class="charRef" data-who="mother">${mother.name}</a>`;
        }
        else if(key=="spouse")
        {
            addition = `${addition}<a href="${spouse.target}" class="charRef" data-who="spouse">${spouse.name}</a>`;
        }
        else if(key=="allegiances")
        {
            addition = `${addition}<ul id="allegiances">`;
            for(let house of allegiances)
            {
                addition = `${addition}<li><a href="${house.target}" class="houseRef" data-index="${allegiances.indexOf(house)}" data-list="allegiances">${house.name}</a></li>`;
            }
            addition = `${addition}</ul>`;
        }
        else if(key=="books")
        {
            addition = `${addition}<ul id="books">`;
            for(let book of books)
            {
                addition = `${addition}<li><a href="${book.target}" class="bookRef" data-index="${books.indexOf(book)}" data-list="books">${book.name}</a></li>`
            }
            addition = `${addition}</ul>`;
        }
        else if(key=="povBooks")
        {
            addition = `${addition}<ul id="povBooks">`;
            for(let book of povBooks)
            {
                addition = `${addition}<li><a href="${book.target}" class="bookRef" data-index="${povBooks.indexOf(book)}" data-list="povBooks">${book.name}</a></li>`
            }
            addition = `${addition}</ul>`;
        }
        else
        {
            addition = `<li>${keyEdit}: ${character[key]}</li>`;
        }
        line = `${line}${addition}</li>`;
    }
    line = `${line}</ul>`;
    //Add the new section into the content section
    section.innerHTML = line;
    document.querySelector("section").className = "fullResult";

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + "</i></p>";

    assignCharactersHandlers();
    //Scroll to new item
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
    //re-enable the input and button
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;
}

//Function to assign every hyperlink a onClick event that sends their contained item to local storage
function assignCharactersHandlers()
{
    //select all classed elements
    let charRefs = document.querySelectorAll(".charRef");
    let houseRefs = document.querySelectorAll(".houseRef");
    let bookRefs = document.querySelectorAll(".bookRef");
    //Add event listeners to all selected elements
    for(let element of charRefs)
    {
        element.addEventListener("click", sendCharacter2);
    }
    for(let element of houseRefs)
    {
        element.addEventListener("click", sendHouse2);
    }
    for(let element of bookRefs)
    {
        element.addEventListener("click", sendBook2);
    }
}

//Function fills the section with characters that can hyperlink to their full information and has the next page buttons
function printCharacterBrowsing()
{
    //Clear the section if it is full
    document.querySelector("section").innerHTML = "";

    let section = document.querySelector("section");
    let heading = document.createElement("h1");
    heading.innerHTML = `Viewing Page ${page} of Characters`;
    heading.style.color = "#020202";
    section.appendChild(heading);
    let list = document.createElement("ul");
    list.className = "browseList";
    list.id = "charList";
    for(let person of characters)
    {
        let item = document.createElement("li");
        item.className = "selfRef";
        let div = document.createElement("div");
        div.className = "resultDiv";
        let name = document.createElement("h2");
        name.style.color = "#CA9645";
        if(person.name.length<1){name.innerHTML = person.aliases[0];}
        else{name.innerHTML = person.name;}
        div.appendChild(name);
        let culture = document.createElement("p");
        culture.className = "charCulture";
        culture.innerHTML= `Culture: ${person.culture}`;
        if(person.culture.length<1)
        {
            culture.innerHTML = "Culture: None";
        }
        div.appendChild(culture);
            if(person.titles[0]){
            let title = document.createElement("p");
            title.className = "title";
            title.innerHTML = person.titles[0];
            title.style.fontStyle = "italic";
            div.appendChild(title);
        }
        let link = document.createElement("a");
        link.href = "characters.html";
        link.target = "_blank";
        link.dataset.url = person.url;
        if(person.name.length<1){link.innerHTML = `See more about ${person.aliases[0]}`;}
        else{link.innerHTML = `See more about ${person.name}`;}
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
    checkNextChar();
    //reable button and input
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + " </i></p>";

    //Assign handlers to all new buttons and links
    assignBrowseHandlersChar();
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
}

//function to assign click handlers for browse mode
function assignBrowseHandlersChar(){
    //Assign click handler to hrefs to send character to local for new page
    let refs = document.querySelectorAll(".selfRef");
    for(let ref of refs)
    {
        ref.addEventListener("click", sendCharacter2);
    }
    //Make prev and next buttons call next and previous page
    let prev = document.querySelector("#prev");
    prev.addEventListener("click", prevClick = (e)=> {
        page-=1;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Characters}?page=${page}`;
        }
        else if(howSearch=="byCulture")
        {
            URL = `${API_Characters}?culture=${dropValue}&page=${page}`;
        }
        getPage2(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
    let next = document.querySelector("#next");
    next.addEventListener("click", prevClick = (e)=> {
        page++;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Characters}?page=${page}`;
        }
        else if(howSearch=="byCulture")
        {
            URL = `${API_Characters}?culture=${dropValue}&page=${page}`;
        }
        getPage2(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
}

function checkNextChar()
{
    let nextPage = page + 1;
    let URL;
    if(howSearch=="browse")
    {
        URL = `${API_Characters}?page=${nextPage}`;
    }
    else if(howSearch=="byCulture")
    {
        URL = `${API_Characters}?culture=${dropValue}&page=${nextPage}`;
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
    xhr.open("GET", URL);
    xhr.send();
}

//function to send character to local storage
function sendCharacter2(e) 
{
    //convert to json format
    let jsonChar;
    if(e.target.dataset.who=="father")
    {
        jsonChar = JSON.stringify(father);
    }
    else if(e.target.dataset.who=="mother")
    {
        jsonChar = JSON.stringify(mother);
    }
    else if(e.target.dataset.who=="spouse")
    {
        jsonChar = JSON.stringify(spouse);
    }
    else
    {
        let sendChar = makeLinkedName("", e.target.dataset.url);
        jsonChar = JSON.stringify(sendChar);
    }
    //send to local storage
    localStorage.setItem(charSearchKey, jsonChar);
}
//function to send house to local storage
function sendHouse2(e)
{
    //convert to json format
    let jsonHouse;
    if(e.target.dataset.list=="allegiances")
    {
        jsonHouse = JSON.stringify(allegiances[e.target.dataset.index]);
    }
    //send to local storage
    localStorage.setItem(houseSearchKey, jsonHouse);
}
//function to send book to local storage
function sendBook2(e)
{
    //convert to json format
    let jsonBook;
    if(e.target.dataset.list=="books")
    {
        jsonBook = JSON.stringify(books[e.target.dataset.index]);
    }
    else if(e.target.dataset.list=="povBooks")
    {
        jsonBook = JSON.stringify(povBooks[e.target.dataset.index]);
    }
    //send to local storage
    localStorage.setItem(booksSearchKey, jsonBook);
}
//function to send the last searched character to local storage
function sendLastChar(character)
{
    let jsonChar = JSON.stringify(character);
    localStorage.setItem(lastSearchedCharKey, jsonChar);
    lastSearchedChar = jsonChar;
}

//OBJECT FACTORIES
//Function to make character objects
function makeCharacter(url, name, gender, culture, born, died, titles, aliases, father, mother, spouse, allegiances, books, povBooks, tvSeries, playedBy)
{
    let character = {
    url: url,
    name: name,
    gender: gender,
    culture: culture,
    born: born,
    died: died,
    titles: titles,
    aliases: aliases,
    father: father,
    mother: mother,
    spouse: spouse,
    allegiances: allegiances,
    books: books,
    povBooks: povBooks,
    tvSeries: tvSeries,
    playedBy: playedBy
    }
    Object.seal(character);
    return character;
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
