window.onload = (e) => {
    document.querySelector("#search").addEventListener("click", searchButtonClicked1);
    document.querySelector("#clear").addEventListener("click", clearButtonClicked1);
    if(storedBooksSearch)
    {
        //disable button and input until the page loads
        document.querySelector("#search").disabled = true;
        document.querySelector("#searchterm").disabled = true;
        //parse into object again
        let storedBook = JSON.parse(storedBooksSearch);
        displayTerm = storedBook.name;
        getData1(storedBook.url);
        localStorage.removeItem(booksSearchKey);
    }
    if(lastSearchedBook){lastSearchedBookCreate();}
}
//variables for controlling local storage
const prefix = "nca6109-";
const charSearchKey = prefix+"charSearch";
const houseSearchKey = prefix+"houseSearch";
const booksSearchKey = prefix+"booksSearch";
const lastSearchedBookKey = prefix+"lastBook";

const storedCharSearch = localStorage.getItem(charSearchKey);
const storedHouseSearch = localStorage.getItem(houseSearchKey);
const storedBooksSearch = localStorage.getItem(booksSearchKey);
//Last searched book
let lastSearchedBook = localStorage.getItem(lastSearchedBookKey);

//general link to api book library
const API_Books = "https://anapioficeandfire.com/api/books/";
//variable determines how we'll search
let howSearch;
let page=1;
//global variables
let displayTerm = "";
let book;
//each list will hold information from API requests until everything is ready to be printed after loading
const foundChars = [];
const foundPOVChars = [];
const books = [];

//Creates the last searched button if there was one
function lastSearchedBookCreate()
{
    //parse JSON into an object
    let storedBook = JSON.parse(lastSearchedBook);
    //get div where last search is displayed
    let lastSearch = document.querySelector("#last");
    //clear lastSearch
    lastSearch.innerHTML="";
    lastSearch.appendChild(document.createTextNode("Last Search: "));
    let link = document.createElement("span");
    link.innerHTML = storedBook.name;
    link.dataset.url = storedBook.url;
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
        getData1(e.target.dataset.url);
        //Update the new last searched house
        if(lastSearchedBook){lastSearchedBookCreate();}
        document.querySelector("#status").innerHTML = "Searching...";
    })
}

//Starts the search when button is clicked and the button and input will be disabled until the search is completed
function searchButtonClicked1()
{
    //disable button and input until the page loads
    document.querySelector("#search").disabled = true;
    document.querySelector("#searchterm").disabled = true;
    document.querySelector("#box").disabled = true;

    //remove info from prior search
    document.querySelector("section").innerHTML = "";
    document.querySelector("section").className = "";
    page = 1;

    let term = whichSearchBook();
    if(!term)
    {
        document.querySelector("#status").innerHTML = "Enter search criteria...";
        //Re-enable buttons
        document.querySelector("#search").disabled = false;
        document.querySelector("#searchterm").disabled = false;
        document.querySelector("#box").disabled = false;
        return;
    }
    //Update the new last searched house
    if(lastSearchedBook){lastSearchedBookCreate();}

    displayTerm = term;
    let termEdit = term.replace(/ /g,'+');
    //check if term is a number and search based on that instead of name
    if(howSearch=="browse")
    {
        let URL = `${API_Books}?page=${page}`;
        getPage1(URL);
        document.querySelector("#status").innerHTML = "Searching...";
        return;
    }
    else if(howSearch=="bySearch")
    {
        if(!isNaN(term))
        {
            //make URL
            let URL = `${API_Books}${termEdit}`;
            getData1(URL);
        }
        else
        {
            //make URL
            let URL = `${API_Books}?name=${termEdit}`;
            getData1(URL);
        }
        document.querySelector("#status").innerHTML = "Searching...";
    }
    else
    {
        document.querySelector("#status").innerHTML = "Enter search criteria...";
    }

}

//Function clears the contents of the search controls
function clearButtonClicked1(e)
{
    let bar = document.querySelector("#searchterm");
    let drop = document.querySelector("#regionDrop");
    let all = document.querySelector("#box");

    bar.value = null;
    all.checked = false;
}

//Function returns the value that will be the search term and changes what search mode the page is in
function whichSearchBook()
{
    let searchBar = document.querySelector("#searchterm");
    let checkBrowse = document.querySelector("#box");

    if(checkBrowse.checked)
    {
        howSearch = "browse";
        return "Just Browsing";
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
function getData1(url){
    //clear gloabal variables
    book = null;
    foundChars.splice(0, foundChars.length);
    foundPOVChars.splice(0, foundPOVChars.length);
    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = bookLoaded;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function to get a JSON page from API
function getPage1(url)
{
    //Clear houses
    books.splice(0,books.length);

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = pageLoaded1;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//Callback Functions
function bookLoaded(e){
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

    //Create a book object witht the info from object so it can be accessed from outside dataLoaded
    if(obj.length<1){dataError(); return;}
    if(obj[0])
    {
        book = makeBook(obj[0].url, obj[0].name, obj[0].isbn, obj[0].authors, obj[0].numberOfPages,obj[0].publisher, obj[0].country, obj[0].mediaType, obj[0].released, obj[0].characters, obj[0].povCharacters);
    }
    else
    {
        book = makeBook(obj.url, obj.name, obj.isbn, obj.authors, obj.numberOfPages,obj.publisher, obj.country, obj.mediaType, obj.released, obj.characters, obj.povCharacters);
    }

    //call functions to fill character arrays with names and links instead of the raw URL's from the JSON file
    fillChars("all");
    fillChars("pov");

    //Send book to the last searched book in local storage
    sendLastBook(book);
}

//Load JSON from API when in browsing mode
function pageLoaded1(e){
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
    for(let book of obj)
    {
        let newBook = makeBook(book.url, book.name, book.isbn, book.authors, book.numberOfPages,book.publisher, book.country, book.mediaType, book.released, book.characters, book.povCharacters);
        books.push(newBook);
    }

    //call function to create browsing page
    printBookBrowsing();
}

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

//get character from API
function getChar(url, who)
{
    //create a new XHR object
    let xhr = new XMLHttpRequest();

    //set the onload handler, different handler for all and pov
    if(who=="all")
    {
        xhr.onload = charLoaded = (e) => 
        {
            let xhr = e.target;
    
            //console.log(xhr.responseText);
    
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //store character name in character variable
            foundChars.push(makeLinkedName(obj.name, obj.url, "characters.html"));
            if(foundChars.length+foundPOVChars.length 
               ==book.characters.length+book.povChars.length)
            {
                printBook();
            }
        };
    }
    else if(who=="pov")
    {
        xhr.onload = charLoaded = (e) => 
        {
            let xhr = e.target;
    
            //console.log(xhr.responseText);
    
            //turn the text into a parsable JavaScript object
            let obj = JSON.parse(xhr.responseText);
            //store character name in character variable
            foundPOVChars.push(makeLinkedName(obj.name, obj.url, "characters.html"));
            if(foundChars.length+foundPOVChars.length 
                ==book.characters.length+book.povChars.length)
            {
                printBook();
            }
        };
    }

    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//function to make characters list fill properly
function fillChars(who)
{
    if(who=="all")
    {
        for(let person of book.characters)
        {   
            getChar(person, who);
        }
    }
    if(who=="pov")
    {
        for(let person of book.povChars)
        {
            getChar(person, who);
        }
    }
}

//Prints out the contents of the book object created from the search
function printBook()
{
    let section = document.querySelector("section");
    let line = `<h1>${book["name"]}</h1><ul>`;
    for(let key in book)
    {
        if(key=="name"){continue;}
        if(key=="url"){continue;}
        let keyEdit = key.charAt(0).toUpperCase() + key.slice(1);
        let addition = `<li>${keyEdit}: `;
        if(key=="characters")
        {
            addition = `${addition}<ul id="chars">`;
            for(let character of foundChars)
            {
                addition = `${addition}<li><a href="${character.target}" class="charRef" data-index="${foundChars.indexOf(character)}" data-list="all">${character.name}</a></li>`;
            }
            addition = `${addition}</ul>`;
        }
        else if(key=="povChars")
        {
            addition = `${addition}<ul id="pov">`;
            for(let character of foundPOVChars)
            {
                addition = `${addition}<li><a href="${character.target}" class="charRef" data-index="${foundPOVChars.indexOf(character)}" data-list="pov">${character.name}</a></li>`;
            }
            addition = `${addition}</ul>`;
        }
        //Everything else is added in "key: list" format
        else
        {
            addition = `<li>${keyEdit}: ${book[key]}</li>`;
        }
        line = `${line}${addition}</li>`;
    }
    line = `${line}</ul>`;
    //Add the new section into the content section
    section.innerHTML = line;
    document.querySelector("section").className = "fullResult";

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + " </i></p>";

    assignBooksHandlers();
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
function assignBooksHandlers()
{
    //select all charRef classed elements
    let charRefs = document.querySelectorAll(".charRef");
    for(let element of charRefs)
    {
        element.addEventListener("click", sendCharacter1);
    }
}

//Function fills the section with houses that can hyperlink to their full information and has the next page buttons
function printBookBrowsing()
{
    //Clear the section if it is full
    document.querySelector("section").innerHTML = "";

    let section = document.querySelector("section");
    let heading = document.createElement("h1");
    heading.innerHTML = `Viewing Page ${page} of Books`;
    heading.style.color = "#020202";
    section.appendChild(heading);
    let list = document.createElement("ul");
    list.className = "browseList";
    list.id = "bookList";
    for(let volume of books)
    {
        let item = document.createElement("li");
        item.className = "selfRef";
        let div = document.createElement("div");
        div.className = "resultDiv";
        let name = document.createElement("h2");
        name.style.color = "#CA9645";
        name.innerHTML = volume.name;
        div.appendChild(name);
        let authors = document.createElement("p");
        authors.className = "authors";
        authors.innerHTML = volume.authors;
        div.appendChild(authors);
        let link = document.createElement("a");
        link.href = "books.html";
        link.target = "_blank";
        link.dataset.url = volume.url;
        link.innerHTML = `See more about ${volume.name}`;
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
    checkNextBook();
    //reable button and input
    document.querySelector("#search").disabled = false;
    document.querySelector("#searchterm").disabled = false;
    document.querySelector("#box").disabled = false;

    //update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is " + displayTerm + " </i></p>";

    //Assign handlers to all new buttons and links
    assignBrowseHandlersBook();
    document.querySelector('section').scrollIntoView({ 
        behavior: 'smooth' 
      });
}

//function to assign click handlers for browse mode
function assignBrowseHandlersBook(){
    //Assign click handler to hrefs to send character to local for new page
    let refs = document.querySelectorAll(".selfRef");
    for(let ref of refs)
    {
        ref.addEventListener("click", sendBook1);
    }
    //Make prev and next buttons call next and previous page
    let prev = document.querySelector("#prev");
    prev.addEventListener("click", prevClick = (e)=> {
        page-=1;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Books}?page=${page}`;
        }
        getPage1(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
    let next = document.querySelector("#next");
    next.addEventListener("click", prevClick = (e)=> {
        page++;
        let URL;
        if(howSearch=="browse")
        {
            URL = `${API_Books}?page=${page}`;
        }
        getPage1(URL);
        document.querySelector("#status").innerHTML = "Searching...";
    })
}

function checkNextBook()
{
    let nextPage = page + 1;
    let URL;
    if(howSearch=="browse")
    {
        URL = `${API_Books}?page=${nextPage}`;
    }
    else if(howSearch=="byCulture")
    {
        URL = `${API_Books}?culture=${dropValue}&page=${nextPage}`;
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
function sendCharacter1(e) 
{
    //convert to json format
    let jsonBook;
    if(e.target.dataset.list=="all")
    {
        jsonBook = JSON.stringify(foundChars[e.target.dataset.index]);
    }
    else if(e.target.dataset.list=="pov")
    {
        jsonBook = JSON.stringify(foundPOVChars[e.target.dataset.index]);
    }
    //send to local storage
    localStorage.setItem(charSearchKey, jsonBook);
}
//function to send book to local storage
function sendBook1(e)
{
    //convert to JSON format
    let jsonBook;
    let sendBook = makeLinkedName("", e.target.dataset.url);
    jsonBook = JSON.stringify(sendBook);
    //send to local storage
    localStorage.setItem(booksSearchKey, jsonBook);
}
//function to send the last searched house to local storage
function sendLastBook(book)
{
    let jsonBook = JSON.stringify(book);
    localStorage.setItem(lastSearchedBookKey, jsonBook);
    lastSearchedBook = jsonBook;
}


//make a book object to store all of the data that is in the JSON file
function makeBook(url, name, isbn, authors, numPages, publisher, country, mediaType, released, characters, povChars)
{
    let book = {
        url: url,
        name: name,
        isbn: isbn,
        authors: authors,
        numPages: numPages,
        publisher: publisher,
        country: country,
        mediaType: mediaType,
        released: released,
        characters: characters,
        povChars: povChars
    }
    Object.seal(book)
    return book;
}
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