let written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	written_tweets = runkeeper_tweets
		.map(tweet => new Tweet(tweet.text, tweet.created_at))
		.filter(tweet => tweet.written);
	updateSearchResults();
}

function addEventHandlerForSearch() {
	document.getElementById('textFilter').addEventListener('input', updateSearchResults);
}

function updateSearchResults() {
	const searchTerm = document.getElementById('textFilter').value.trim();
	const matchingTweets = searchTerm
		? written_tweets.filter(tweet => tweet.writtenText.toLowerCase().includes(searchTerm.toLowerCase()))
		: [];

	document.getElementById('searchCount').innerText = matchingTweets.length;
	document.getElementById('searchText').innerText = searchTerm;
	document.getElementById('tweetTable').innerHTML = matchingTweets
		.map((tweet, index) => tweet.getHTMLTableRow(index + 1))
		.join('');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});