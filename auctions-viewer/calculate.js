/*
Note to future Shaman:
Auctions do not need API keys, unless you are searching for auctions by a specific player. 
Implement both, but prioritize the normal one rather than the player auctions search. Make sure both fit on the page and make sense.
Put the first in auctions-viewer, put the second in player-auctions-viewer.
*/

function loadOne() {
    document.getElementById("loadone").innerHTML = "Reload One";
    document.getElementById("loadall").innerHTML = "Load All";
    getAuctions(0);
}

function loadAll() {
    document.getElementById("loadone").innerHTML = "Load One";
    document.getElementById("loadall").innerHTML = "Reload All";
    getAuctions(1);
}

async function getAuctions(type) {
    window.SB_Item_List = [];
    window.SB_Item_List.push(await getPage(0));
    if (type == 1) {
        //Put code to request all pages here.
    }
}


async function getPage(page) {
    let auctionsURL = new URL('https://api.hypixel.net/skyblock/auctions')
    auctionsURL.searchParams.set('page', page);
    const auctionPageData = await fetch(auctionsURL);
    const auctionPageJSON = await auctionPageData.json();
    console.log(auctionPageJSON);
    return auctionPageJSON;
}

function search() {
    const search_input = document.getElementById("search_bar").value;
    console.log(search_input);
    const search_results = window.SB_Item_List.map(search_map);
    //Add search settings that allow you to search specifically name, lore, or both. Add things that can allow you to search
}

function search_map(element, index) {
    const auctions = element[auctions];
    for (let i=0; i < 10; i++) {
        const auctions2 = auctions[i];
        const x = auctions2.map(specific_search);
    }
}

function specific_search(element, index, prev_index) {
    console.log("Element", element);
    console.log("Index", index);
    console.log("prev_index", index);
}
