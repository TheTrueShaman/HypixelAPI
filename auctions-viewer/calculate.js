/*
Note to future Shaman:
Auctions do not need API keys, unless you are searching for auctions by a specific player. 
Implement both, but prioritize the normal one rather than the player auctions search. Make sure both fit on the page and make sense.
Put the first in auctions-viewer, put the second in player-auctions-viewer.
*/

async function getPage(page) {
    let auctionsURL = new URL('https://api.hypixel.net/skyblock/auctions')
    auctionsURL.searchParams.set('page', page);
    const auctionPageData = await fetch(auctionsURL);
    console.log(auctionPageData);
    const auctionPageJSON = await auctionPageData.json();
    console.log(auctionPageJSON);
}
