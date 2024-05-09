async function getAuctions(type) {
	let auctionsList = [];
	auctionsList.push(await getAuctionsPage(0));
	let pages = auctionsList[0]['totalPages']
	for (let i = 1; i < pages; i++) {
		auctionsList.push(await getAuctionsPage(i));
	}

	let binList = [];
	let item;
	for (let i = 0; i < auctionsList.length; i++) {
		item = auctionsList[i];
		if (item['bin'] === false || item['claimed'] == true) {
			continue;
		}

		binList.push({ name: item['item_name'], starting_bid: item['starting_bid'], rarity: item['tier']);
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
}
