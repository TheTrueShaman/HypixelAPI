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
        let pages = window.SB_Item_List[0]['totalPages']
        for (let i = 1; i < pages; i++) {
            window.SB_Item_List.push(await getPage(i));
        }
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

function settings(setting) {
    const id = "option" + setting.toString();
    window.search_settings[setting-1] = !window.search_settings[setting-1];
    if (window.search_settings[setting-1] == false) {
        document.getElementById(id).innerHTML = "Off"
    } else {
        document.getElementById(id).innerHTML = "On"
    }
}

function search() {
    if (!window.SB_Item_List) {
        window.SB_Item_List = [];
    }
    window.search_input = document.getElementById("search_bar").value;
    console.log(window.search_input);
    const settings = JSON.stringify(window.search_settings);
    let search_results = [];
    if (settings == JSON.stringify([true, true, true])) {
        console.log("Search 1");
    } else if (settings == JSON.stringify([true, true, false])) {
        console.log("Search 2");
        search_results = window.SB_Item_List.map(search_map_title_lore);
    } else if (settings == JSON.stringify([true, false, true])) {
        console.log("Search 3");
    } else if (settings == JSON.stringify([true, false, false])) {
        console.log("Search 4");
    } else if (settings == JSON.stringify([false, true, true])) {
        console.log("Search 5");
    } else if (settings == JSON.stringify([false, true, false])) {
        console.log("Search 6");
    } else {
        console.log("Search not possible.");
    }
    console.log(search_results);
    //Add search settings that allow you to search specifically name, lore, or both. Add things that can allow you to search
}

function search_map_title_lore(element, index) {
    console.log(element);
    console.log(index);
    const includes = [];
    const auctions = element["auctions"];
    const regex = new RegExp(window.search_input, 'i');
    for (let a=0; a<auctions.length; a++) {
        const auction = auctions[a];
        const text = (auction["item_lore"] + auction["item_name"]).replaceAll(/§([a-z]|[0-9])/g, '');
        if (text.search(regex) != -1) {
            includes.push([index,a]);
        }
    }
    console.log(includes);
    return includes;
}
