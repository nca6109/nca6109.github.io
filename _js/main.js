//Tracking variables
let numOfProjects;
let winWidthInit;
let winHeightInit;
let allProjects;
let shownProjects = [];
let hiddenProjects = [];

window.onload = e => {
    let numOfProjects = document.querySelectorAll(".project").length;
    allProjects = document.querySelectorAll(".project");
    if(numOfProjects>2){createGalleryDropdown();}
}

function createGalleryDropdown(){
    //store all project nodes in arrays
    for(let i=0; i<allProjects.length; i++){
        if(i<2){
            shownProjects.push(allProjects[i]);
        }
        else{
            hiddenProjects.push(allProjects[i]);
        }
    }
    //remove the hidden projects from the page after they are stored
    for(let project of hiddenProjects){
        project.remove();
    }

    //create a new node that will be a button
    let moreProjects = document.querySelector("#more");
    moreProjects.onclick = showMore;
    moreProjects.onmouseover = function(e){e.target.style.fontWeight="bold";}
    moreProjects.onmouseout = function(e){e.target.style.fontWeight="normal";}
    
}

function showMore(){
    let gallery = document.querySelector("#gallery");
    let more = document.querySelector("#more");
    for(let i=0; i<hiddenProjects.length; i++){
        gallery.appendChild(hiddenProjects[i]);
        let addedChild = document.querySelectorAll(".project");
        if(i%2==0){addedChild[addedChild.length-1].style.marginLeft=0;}
    }
    more.innerHTML = `Show Less <i class="fas fa-chevron-up"></i>`;
    more.onclick = showLess;
}
function showLess(){
    for(let project of hiddenProjects){
        project.remove();
    }
    more.innerHTML = `Show More <i class="fas fa-chevron-down">`;
    more.onclick = showMore;
}