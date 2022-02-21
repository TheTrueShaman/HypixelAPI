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
    window.SB_Item_List = await getPage(0);
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
}
