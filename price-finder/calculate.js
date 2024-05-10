async function getAuctions(type) {
	let auctionsList = [];
	auctionsList.push(await getAuctionsPage(0));
	let pages = auctionsList[0]['totalPages']
	for (let i = 1; i < pages; i++) {
		auctionsList.push(await getAuctionsPage(i));
	}

	let binList = [];
	let item;
	for (let a = 0; a < auctionsList.length; a++) {
		for (let b = 0; b < auctionsList[a]['auctions'].length; b++) {
			item = auctionsList[a]['auctions'][b];
			if (item['bin'] === false || item['claimed'] === true) {
				continue;
			}

			let bytes = convertNbtToJson(item['item_bytes'])
			if (!bytes) {
				continue;
      			}
	
			binList.push({ id: bytes[0].tag.ExtraAttributes.id, name: item['item_name'], price: item['starting_bid'], rarity: item['tier']});
		}
	}

	let itemPriceList = {}

	for (let i = 0; i < binList.length; i++) {
		item = binList[i];
		if (itemPriceList[item['id']]) {
			if (item.price > itemPriceList[item['id']].price) {
				continue;
			}
			
			if (item.id === 'PET') {
				// Pets are not currently supported
				continue;
			}
		}

		itemPriceList[item['id']] = {name: item['name'], price: item['price']};
	}

	return itemPriceList;
}

async function getAuctionsPage(page) {
	let auctionsURL = new URL('https://api.hypixel.net/v2/skyblock/auctions')
	auctionsURL.searchParams.set('page', page);
	const auctionPageData = await fetch(auctionsURL);
	const auctionPageJSON = await auctionPageData.json();
	console.log(auctionPageJSON);
	return auctionPageJSON;
}

async function getBazaar() {
	const bazaarData = await fetch('https://api.hypixel.net/v2/skyblock/bazaar');
	const bazaarJSON = await bazaarData.json();

	let bazaarList = {};
	let product;
	for (productKey in bazaarJSON['products']) {
		product = bazaarJSON['products'][productKey];
		bazaarList[product['quick_status']['productId']] = {price: product['quick_status']['buyPrice']};
	}

	return bazaarList;
}

async function getItems() {
	const itemsData = await fetch('https://api.hypixel.net/v2/resources/skyblock/items');
	const itemJSON = await itemData.json();

	let itemList;
	for (item in itemJSON.items) {
		itemList[item['name']] = item['id'];
	}
	
	return itemList;
}

async function loadAll() {
	let finalTable = {};
	let auctionsList = await getAuctions();
	Object.assign(finalTable, auctionsList);
	let bazaarList = await getBazaar();
	Object.assign(finalTable, bazaarList);
	let nameToId = await getItems();

	window.finalTable = finalTable;
	window.nameToId = nameToId;
	document.getElementById("warning").style.display = "none";
	console.log(finalTable);
}

loadAll();

function search() {
	if (!window.finalTable) {
	    return;
	}
	
	window.search_input = document.getElementById("search_bar").value;
    	if (window.search_input != '') {
		const searchItems = window.search_input.split('; ');
		let costs = {};
		let item;
		for (let i = 0; i < searchItems.length; i++) {
			item = searchItems[i];
			if (window.finalTable[item]) {
				costs[item] = window.finalTable[item].price;
			} else if (window.nameToId[item]) {
				costs[item] = window.finalTable[window.nameToId[item]].price;
			} else {
				console.warn("No price found for: " + item);
			}
		}
		console.log(costs);
	} else {
		document.getElementById('main').innerHTML = '';
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
