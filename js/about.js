function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const earliestTweet = tweet_array.reduce((earliest, tweet) => tweet.time < earliest.time ? tweet : earliest);
	const latestTweet = tweet_array.reduce((latest, tweet) => tweet.time > latest.time ? tweet : latest);
	const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
	document.getElementById('firstDate').innerText = earliestTweet.time.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latestTweet.time.toLocaleDateString('en-US', dateOptions);

	const completedEvents = tweet_array.filter(tweet => tweet.source === 'completed_event');
	const liveEvents = tweet_array.filter(tweet => tweet.source === 'live_event');
	const achievements = tweet_array.filter(tweet => tweet.source === 'achievement');
	const miscellaneous = tweet_array.filter(tweet => tweet.source === 'miscellaneous');
	const writtenTweets = completedEvents.filter(tweet => tweet.written);
	const formatPercentage = (count, total) => total === 0 ? '0.00%' : `${math.format(count * 100 / total, { notation: 'fixed', precision: 2 })}%`;
	const updateClass = (className, value) => {
		document.querySelectorAll(`.${className}`).forEach(element => element.innerText = value);
	};

	updateClass('completedEvents', completedEvents.length);
	updateClass('completedEventsPct', formatPercentage(completedEvents.length, tweet_array.length));
	updateClass('liveEvents', liveEvents.length);
	updateClass('liveEventsPct', formatPercentage(liveEvents.length, tweet_array.length));
	updateClass('achievements', achievements.length);
	updateClass('achievementsPct', formatPercentage(achievements.length, tweet_array.length));
	updateClass('miscellaneous', miscellaneous.length);
	updateClass('miscellaneousPct', formatPercentage(miscellaneous.length, tweet_array.length));
	updateClass('written', writtenTweets.length);
	updateClass('writtenPct', formatPercentage(writtenTweets.length, completedEvents.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});