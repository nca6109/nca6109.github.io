let library;

//Onload function
window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked;
    //set default for library
    library = "books";
    //event handler for changing the search library
    document.querySelector("#libraryChooser").onchange = (e) => {
    library = e.target.value;
    }
};

//Function to print info about the searched file
function searchButtonClicked() {
    const API_URL = "https://anapioficeandfire.com/api/";
    document.querySelector("#results").innerHTML = "";
    let url = API_URL;
    url += library+"/";
    let num = document.querySelector("#searchIndex").value;
    num = num.trim();
    num = encodeURIComponent(num);
    if(num.length<1) return;
    url += num;
    //Debug check url
    console.log(url);
    //request data
    getData(url);
}

//funciton to get data from API
function getData(url){
    //create a new XHR object
    let xhr = new XMLHttpRequest();

    //set the onload handler
    xhr.onload = dataLoaded;

    //set the onerror handler
    xhr.onerror = dataError;

    //open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

//Callback Functions
function dataLoaded(e){
    //event.target is the xhr object
    let xhr = e.target;

    if(xhr.status=="404")
    {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + library + document.querySelector("#searchIndex").value + "'</b>";
        return; // Bail out
    }

    //xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    //turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);
    let string;
    //if there are no results, print a message and return
    if(!obj.name || obj.name.length == 0)
    {
        if(obj.aliases)
        {
            aliases = obj.aliases;
            string = `Alias: ${aliases[0]}`;
            document.querySelector("#results").innerHTML = string;
            document.querySelector("#status").innerHTML = "<em>Success</em>";
        }
        else
        {
            document.querySelector("#status").innerHTML = "<b>Name: Unnamed</b>";
        }
        return; // Bail out
    }

    string = `Name: ${obj.name}`;
    document.querySelector("#results").innerHTML = string;
    document.querySelector("#status").innerHTML = "<em>Success</em>";
}

function dataError(e){
    console.log("An error occurred");
    return;
}