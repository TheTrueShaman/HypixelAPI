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
    if (window.search_input != '') {
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
        display_results(search_results);
    } else {
        document.getElementById('main').innerHTML = '';
    }
}

function search_map_title_lore(element, index) {
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
    return includes;
}

function display_results(results) {
	if (results.length != 0) {
		document.getElementById('main').innerHTML = '<div id="itemview"></div><div id="inventoryview"></div><div class="selection" style="width: calc(calc(9 * calc(var(--inv-size) + calc(var(--inv-size)/8))) + calc(var(--inv-size)/2))"><button id="previous" onclick="previous()">Not Possible</button><button id="next" onclick="next()">Not Possible</button></div>';
		let results_amount = 0;
		let better_results = [];
		for (let a = 0; a < results.length; a++) {
			results_amount += results[a].length;
			better_results = better_results.concat(results[a]);
		}
		console.log(better_results);	
		window.index = 0;
		window.items = []
		for (let i = 0; i < better_results.length; i++) {
			window.items.push(window.SB_Item_List[better_results[i][0]]['auctions'][better_results[i][1]]);
		}
		if (window.items.length > 54) {
			document.getElementById('next').innerHTML = 'Next';
		}
		draw_inventory();
	}
}

function better_stringify(item) {
	let keys = Object.keys(item);
	var stringified = "["
	for(var i = 0; i < keys.length; i++){
		stringified+=JSON.stringify(item[keys[i]])+",";
	}
	stringified += "]";
	console.log(item);
}

function draw_inventory() {
	let results_amount= window.items.length;
	if (results_amount % 9 != 0) {
		results_amount += (9 - (results_amount % 9));
	}
	document.getElementById('inventoryview').innerHTML = '';
	for (let i = 0; i < Math.min((results_amount - window.index), 54); i++) {
		document.getElementById('inventoryview').innerHTML = document.getElementById('inventoryview').innerHTML + '<div class="inventoryslot"></div>';
	}
	for (let i = window.index; i < Math.min((window.items.length - window.index), 54 + window.index); i++) {
		let command = "write_slot(" + JSON.stringify(convertNbtToJson(window.items[i]['item_bytes'])[0]) + ")";
		better_stringify(convertNbtToJson(window.items[i]['item_bytes'])[0]);
		document.getElementsByClassName("inventoryslot")[i].setAttribute("onmouseover", command);
		document.getElementsByClassName("inventoryslot")[i].setAttribute("onmouseout", "document.getElementById('itemview').innerHTML = '';");
		document.getElementsByClassName("inventoryslot")[i].innerHTML = draw_slot(convertNbtToJson(window.items[i]['item_bytes'])[0]);
	}
}


function write_slot(slot) {
    if (slot.tag) {
        let display = "";
        let line = "";
        let stylecodes = {
            "§0": "color: #000000",
            "§1": "color: #0000aa",
            "§2": "color: #00aa00",
            "§3": "color: #00aaaa",
            "§4": "color: #aa0000",
            "§5": "color: #aa00aa",
            "§6": "color: #ffaa00",
            "§7": "color: #aaaaaa",
            "§8": "color: #555555",
            "§9": "color: #5555ff",
            "§a": "color: #55ff55",
            "§b": "color: #55ffff",
            "§c": "color: #ff5555",
            "§d": "color: #ff55ff",
            "§e": "color: #ffff55",
            "§f": "color: #ffffff",
            "§l": "font-weight:bold"
        }
        display = display + format_line(slot.tag.display.Name, stylecodes);
        display = display + format_line("", stylecodes);
        for (let i = 0; i < slot.tag.display.Lore.length; i++) {
            display = display + format_line(slot.tag.display.Lore[i], stylecodes);
        }
        document.getElementById("itemview").innerHTML = display;
    }
}

function format_line(line, stylecodes) {
	let display_line = "<span class=\"loreline\">";
	let where = line.search("§");
	let style;
	let styles = {};
	let close = false;
	let lineadd = false;
	let y;
	while (where != -1) {
		y = 1;
		styles = {};
		while (stylecodes[line.slice(where+(2*(y-1)), where+(2*y))] != undefined) {
			if (!(line.slice(where+(2*(y-1)), where+(2*y)) in styles)) {
				let newstyle = line.slice(where+(2*(y-1)), where+(2*y))
				styles[newstyle] = 1;
			}
			y = y + 1;
		}
	
		if (close == true) {
			display_line = display_line + line.slice(0, where) + "</span>";
		} else {
			close = true; 
		}  
        
		let styles_string = "";
		for (const property in styles) {
			styles_string = styles_string + stylecodes[`${property}`] + "; ";
		}
		if (styles_string != "") {
			display_line = display_line + "<span style=\"" + styles_string + "\">"
		} else {
			display_line = display_line + "<span>"
		}
        
		line = line.slice(where + (2*(y-1)));
		where = line.search("§");
		lineadd = true;
	}
	if (lineadd == true) {
		display_line = display_line + line + "</span>"; 
	}
	display_line = display_line + "</span>\n";
	return display_line;
}

document.documentElement.addEventListener("mousemove", e => {
	document.documentElement.style.setProperty('--mouse-x', e.clientX + "px");
	document.documentElement.style.setProperty('--mouse-y', e.clientY + "px");
});

function draw_slot(slot) {
	if (slot.id) {
		let text = "<div class=\"item-icon icon-" + slot.id + "_0";
		text = text + "\"></div>";
		if (slot.Count != 1) {
			text = text + "<div class=\"item-count\">" + slot.Count + "</div>";
		}
		return text;
	} else {
		return ""; 
	}
}

function convertNbtToJson(t) {
	let data;
	try {
		const n=Uint8Array.from(atob(t),t=>t.charCodeAt(0)),a=new Zlib.Gunzip(n).decompress();
		nbt.parse(a,function(t,n){if(t)throw t;data=n})
	} catch(t) {
		console.log("Invalid input: couldn't parse nbt data");
	}
	return data;
}

function next() {
	if (window.index + 54 < window.items.length) {
		window.index += 54;
		draw_inventory();
		if (window.index > 0) {
			document.getElementById('previous').innerHTML = 'Previous';
		} else {
			document.getElementById('previous').innerHTML = 'Not Possible';
		}
		if (window.index + 54 < window.items.length) {
			document.getElementById('next').innerHTML = 'Next';
		} else {
			document.getElementById('next').innerHTML = 'Not Possible';
		}
	}
}

function previous() {
	if (window.index > 0) {
		window.index -= 54;
		draw_inventory();
		if (window.index > 0) {
			document.getElementById('previous').innerHTML = 'Previous';
		} else {
			document.getElementById('previous').innerHTML = 'Not Possible';
		}
		if (window.index + 54 < window.items.length) {
			document.getElementById('next').innerHTML = 'Next';
		} else {
			document.getElementById('next').innerHTML = 'Not Possible';
		}
	}
}
