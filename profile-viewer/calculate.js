function getURL() {
    if (window.location.search) {
        var searches = window.location.search;
        var poskey = searches.search("&key=");
        getUser(searches.slice(5,poskey), searches.slice(poskey+5,));
    } else {
        create_form();
    }
}

async function getUser(username, key) {
    let uuidURL = 'https://api.ashcon.app/mojang/v2/user/' + username;
    const uuidData = await fetch(uuidURL);
	
    if (uuidData.ok == false) {
		console.log("Invalid Minecraft Username."); 
		return 0;
    }
    const uuidjson = await uuidData.json();
    let uuid = uuidjson.uuid;
    uuid = uuid.replace(/-/g, '');
    
    
    let keyURL = new URL('https://api.hypixel.net/key');
    keyURL.searchParams.set('key', key);
    const keydata = await fetch(keyURL);
    if (keydata.status == 403) {
        console.log("Invalid API key.");
        return 0;
    } else if (keydata.status == 429) {
        console.log("API key throttle.");
        return 0;
    }

    
    let profileURL = new URL('https://api.hypixel.net/skyblock/profiles')
    profileURL.searchParams.set('key', key);
    profileURL.searchParams.set('uuid', uuid);
    const profiledata = await fetch(profileURL);
    if (profiledata.status == 400) {
        console.log("Missing one or more fields.");
        return 0;
    } else if (profiledata.status == 403) {
        console.log("Invalid API key.");
        return 0;
    } else if (profiledata.status == 422) {
        console.log("Malformed UUID.");
        return 0;
    } else if (profiledata.status == 429) {
        console.log("API key throttle");
        return 0;
    } 
    const profilejson = await profiledata.json();
    if (profilejson.profiles == null) {
        return 0; 
    }
    
    
    let profileamount = profilejson.profiles.length;
    let mostrecent = 0;
    let recentprofilenum = 0;
    let recentprofilename = "";
    for (let i = 0; i < profileamount; i++) {
        if (profilejson.profiles[i].members[uuid].last_save > mostrecent) {
            mostrecent = profilejson.profiles[i].members[uuid].last_save;
            recentprofilenum = i;
            recentprofilename = profilejson.profiles[i].cute_name;
        }
    }
    getStats(username, key, uuid, uuidjson, recentprofilenum, profilejson);
}

function getLevel(skill, profilejson, skillsjson, profilenum, uuid) {
    let x = 0
    let SKILL = skill.toUpperCase();
    let experience_skill = "experience_skill_" + skill;
    while (x < skillsjson.collections[SKILL].levels.length) {
        if (profilejson.profiles[profilenum].members[uuid][experience_skill] < skillsjson.collections[SKILL].levels[x].totalExpRequired) {
            break;
        } else {
            x += 1; 
        }
    }
    return x;
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

async function getStats(username, key, uuid, uuidjson, profilenum, profilejson) {
    let skyblockskill = await fetch("https://api.hypixel.net/resources/skyblock/skills");
    let skillsjson = await skyblockskill.json();
    var levels = {"skills":{}, "dungeons":{}};
    var skills = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'taming'];
    
    console.log(profilejson);
    
	for (let i = 0; i < skills.length; i++) {
		levels["skills"][skills[i]] = {};
		let level = getLevel(skills[i], profilejson, skillsjson, profilenum, uuid);
		levels["skills"][skills[i]]["level"] = level;
		levels["skills"][skills[i]]["xp"] = profilejson.profiles[profilenum].members[uuid]['experience_skill_'+skills[i]] - skillsjson.collections[skills[i].toUpperCase()].levels[level-1].totalExpRequired;
	}
	console.log(levels);
	let nbtinventory = profilejson.profiles[profilenum].members[uuid].inv_contents.data;
	let json_inventory = convertNbtToJson(nbtinventory);
	console.log(json_inventory);
	document.getElementById('main').innerHTML = '<div id="itemview"></div><div id="inventoryview"></div>';
	for (let i=0; i<36; i++) {
		document.getElementById('inventoryview').innerHTML = document.getElementById('inventoryview').innerHTML + '<div class="inventoryslot"></div>';
		if (i == 26) {
			document.getElementById('inventoryview').innerHTML = document.getElementById('inventoryview').innerHTML + '<hr style="all: unset; grid-column: 1/10; height: calc(var(--inv-size)/4);">';
		}
	}
	for (let i=0; i<36; i++) {
		if (i < 9) {
			let command = "write_slot(" + JSON.stringify(json_inventory[i]) + ")";
			document.getElementsByClassName("inventoryslot")[27+i].setAttribute("onmouseover", command);
			document.getElementsByClassName("inventoryslot")[27+i].setAttribute("onmouseout", "document.getElementById('itemview').innerHTML = '';");
			document.getElementsByClassName("inventoryslot")[27+i].innerHTML = draw_slot(json_inventory[i]);
		} else {
			let command = "write_slot(" + JSON.stringify(json_inventory[i]) + ")";
			document.getElementsByClassName("inventoryslot")[i-9].setAttribute("onmouseover", command);
			document.getElementsByClassName("inventoryslot")[i-9].setAttribute("onmouseout", "document.getElementById('itemview').innerHTML = '';");
			document.getElementsByClassName("inventoryslot")[i-9].innerHTML = draw_slot(json_inventory[i]);
		}
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
			"§l": "font-weight:bold",
			"§m": "text-decoration: line-through",
			"§n": "text-decoration: underline",
			"§o": "font-style: italic;",
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
	line = line.replaceAll('§k','');
	line = line.replaceAll('§r','');
	line = line.replaceAll('§L','');
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

function create_form() {
	document.getElementById("main").innerHTML = "<div style=\"margin:20px\"><form><p>Show Skyblock Stats for:</p><input name=\"ign\" type=\"search\" placeholder=\"Enter username\" pattern=\"\\w{1,}\" autofocus required><p>Your API key:</p><input name=\"key\" type=\"search\" placeholder=\"Enter your API key\" autofocus required><br><button type=\"submit\">Show stats</button></form></div>";
}
