const sortableList = document.querySelector(".sortable-list");
const items = sortableList.querySelectorAll(".item");
const inputField = document.querySelector('[name="player"');
const addbutton = document.querySelector('#add-name');
const resetbutton = document.querySelector('#reset');
const removebutton = document.querySelector('.remove-self');
const teamList = document.querySelector(".team-item");
const message = document.querySelector(".message");

//
// Player list
// -----------------------
items.forEach(item => {
    item.addEventListener("dragstart", () => {
        // Adding dragging class to item after a delay
        setTimeout(() => item.classList.add("dragging"), 0);
    });
    // Removing dragging class from item on dragend event
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
});

const initPlayerList = (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    // Getting all items except currently dragging and making array of them
    let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];

    // Finding the sibling after which the dragging item should be placed
    let nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });

    // Inserting the dragging item before the found sibling
    sortableList.insertBefore(draggingItem, nextSibling);

    storePlayerList();
    generateGameBoard(getPlayerList());
}

const getPlayerList = () => {
    let tempArray = [];
    let currentOrder = [...sortableList.querySelectorAll(".item")]
    currentOrder.forEach(item=>{
        tempArray.push(item.querySelector(".details>span").innerHTML);
    });

    return tempArray.slice(0,10) ; //always max 10 names each time
}

//
// Player add/edit/remove
// ---------------------------
const createPlayer = (name) =>{
    if(name != ''){
        // Create a list item element
        var li = document.createElement("li");

        // Set the class and draggable attributes
        li.setAttribute("class", "item");
        li.setAttribute("draggable", "true");

        // Create a div element for the details
        var div = document.createElement("div");

        // Set the class attribute
        div.setAttribute("class", "details");

        // Create an icon element
        var removeBtn = document.createElement("i");

        // Set the class attribute
        removeBtn.setAttribute("class", "uil uil-cancel remove-self");
        removeBtn.addEventListener('click', removePlayer);
        // Append the span to the div
        div.appendChild(removeBtn);

        // Create a span element for the name
        var span = document.createElement("span");

        // Set the text content
        span.textContent = name;

        // Append the span to the div
        div.appendChild(span);

        // Create an icon element
        var i = document.createElement("i");

        // Set the class attribute
        i.setAttribute("class", "uil uil-draggabledots");

        // Append the div and the icon to the list item
        li.appendChild(div);
        li.appendChild(i);

        li.addEventListener("dragstart", () => {
            // Adding dragging class to item after a delay
            setTimeout(() => li.classList.add("dragging"), 0);
        });
        // Removing dragging class from item on dragend event
        li.addEventListener("dragend", () => li.classList.remove("dragging"));

        return li;
    }
    return false;
}

const addPlayer = ()=>{
    console.log(getPlayerList().length);
    let roomspace = 10 - getPlayerList().length;
    inputField.value.split(/,|，|，/).forEach((player,index)=>{
        if(index < roomspace) {
            insertPlayerToList(createPlayer(player));
            message.innerHTML = '';
        } else {
            message.innerHTML = `the room is full, player ${player} cannot be added to the list`;
        }
    });
    inputField.value = ''; //reset after insert;
    storePlayerList();
}

const removePlayer =(e)=>{
    let target = e.target.closest('.item');
    target.remove();
    storePlayerList();
}

const insertPlayerToList = (e) =>{
    if(sortableList.querySelectorAll('.item.demo').length > 0){
        sortableList.innerHTML=''; //remove the init element from list
    }
    if(e) {
        sortableList.append(e);
    };
}


//
// Generate Grouped List
// --------------------------
const pairingPlayer = (playerList) => {
    console.log(`generateGameBoard with this list: ${playerList.toString()}`);

    let partyMember = [];
    playerList.forEach((player,index)=>{
        if(partyMember[index] == undefined){
            partyMember[index] = [];
        }
        let teammate = playerList.filter((item)=> item !== player );
        let nums = teammate.length>6 ? 3:2; // numbers of group [1,1,1,2,2,3,3,3]
        let count =  teammate.length/nums;
        console.log(`Leader: ${player}, teammate x ${teammate.length}: ${teammate.toString()}, teams person per group = ${count}`);

        if(teammate.length > 3){
            do{
                for(i=0; i < nums; i++){
                    if(partyMember[index][i] == undefined){
                        partyMember[index][i] = [];
                    }
                    if(teammate.length != 0){
                        if(partyMember[index][i].length == 2){
                            partyMember[index][i].push(teammate.pop());
                        } else {
                            partyMember[index][i].push(teammate.pop());
                            partyMember[index][i].push(teammate.shift());
                        }
                    }
                }
            } while ( teammate.length > 0);
        } else {
            partyMember[index][0] = teammate;
        }
    });

    return partyMember;
}
const createParty = (player, playerMembers) =>{
    if(player){
        const li = document.createElement("li");
        const span = document.createElement("span");
                
        span.classList.add("name");
        span.textContent = player;
        li.appendChild(span);

                
        const teammate = document.createElement("ol");
        playerMembers.forEach((team,i) => {
            let teamListItem = document.createElement("li");
            teamListItem.textContent = team.join(', ');
            teammate.appendChild(teamListItem);
            teamListItem.addEventListener('click', (e)=>{
                e.target.classList.toggle('done');
            })
        });

        li.appendChild(teammate);
        
        return li;
    }

}

const generateGameBoard = (playerList) => {
    let list = pairingPlayer(playerList);
    teamList.innerHTML='';
    list.forEach((item,i) => {
        console.log(item);
        teamList.append(createParty(getPlayerList()[i],item));
        //item.forEach((child,j) => {
           // console.log(`player ${[i]} - ${getPlayerList()[i]}'s get team ${j} members: ${child.toString()}`);
        //})
       // item.forEach(value => sum+=parseInt(value) )
    })
    console.log(list);
};


//
// Storage - Get and Set player's name to localstorage
// --------------------------
const storePlayerList = () => {
    localStorage.setItem('mhn-players',getPlayerList());
    generateGameBoard(getPlayerList());
}

const loadPlayerList = () =>{
    if(players = localStorage.getItem('mhn-players')){
        if(players == 'undefined'){
            return;
        }
        let playersArr = players.split(/,|，|，/);

        playersArr.forEach(player=>{
            insertPlayerToList(createPlayer(player));
        });
        generateGameBoard(getPlayerList());
    }

}

const resetPlayerList = ()=>{
    localStorage.removeItem('mhn-players');
    window.location.reload();
}


///
/// Bind events
/// ---------------------------

document.addEventListener('DOMContentLoaded',loadPlayerList);

sortableList.addEventListener("dragover", initPlayerList);
sortableList.addEventListener("dragenter", e => e.preventDefault());

addbutton.addEventListener('click', addPlayer);
resetbutton.addEventListener('click', resetPlayerList);
removebutton.addEventListener('click', removePlayer);
