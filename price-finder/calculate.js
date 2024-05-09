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
			if (item['bin'] === false || item['claimed'] == true) {
				continue;
			}
	
			binList.push({ name: item['item_name'], price: item['starting_bid'], rarity: item['tier']});
		}
	}

	return binList;
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

	let bazaarList = [];
	for (product in bazaarData['products']) {
		bazaarList.push({ id: product['quick_status']['productId'], price: product['quick_status']['buyPrice']});
	}

	return bazaarList;
}
