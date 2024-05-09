async function getAuctions(type) {
	window.SB_Item_List = [];
	window.SB_Item_List.push(await getAuctionsPage(0));
	let pages = window.SB_Item_List[0]['totalPages']
	for (let i = 1; i < pages; i++) {
		window.SB_Item_List.push(await getAuctionsPage(i));
	}
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
  //https://api.hypixel.net/v2/skyblock/bazaar
}
