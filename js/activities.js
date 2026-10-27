function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event' && tweet.activityType !== 'unknown');
	const activityCounts = new Map();
	completedTweets.forEach(tweet => activityCounts.set(tweet.activityType, (activityCounts.get(tweet.activityType) || 0) + 1));
	const activityCountValues = [...activityCounts]
		.map(([activityType, count]) => ({ activityType, count }))
		.sort((first, second) => second.count - first.count);
	const topActivityTypes = activityCountValues.slice(0, 3).map(activity => activity.activityType);

	document.getElementById('numberActivities').innerText = activityCountValues.length;
	document.getElementById('firstMost').innerText = topActivityTypes[0] || 'unknown';
	document.getElementById('secondMost').innerText = topActivityTypes[1] || 'unknown';
	document.getElementById('thirdMost').innerText = topActivityTypes[2] || 'unknown';

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityCountValues
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": { "field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type" },
	    "y": { "field": "count", "type": "quantitative", "title": "Number of tweets" }
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const distanceValues = completedTweets
		.filter(tweet => topActivityTypes.includes(tweet.activityType) && tweet.distance > 0)
		.map(tweet => ({
			activityType: tweet.activityType,
			distance: tweet.distance,
			day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tweet.time.getUTCDay()]
		}));
	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	const rawDistanceValues = distanceValues.map(value => ({ ...value, displayMode: 'raw' }));
	const meanDistanceValues = distanceValues.map(value => ({ ...value, displayMode: 'mean' }));
	const distanceSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Activity distances by day of the week.",
		"data": { "name": "distanceData" },
		"layer": [
			{
				"description": "Activity distances by day of the week.",
				"transform": [{ "filter": "datum.displayMode === 'raw'" }],
				"mark": "point",
				"encoding": {
					"x": { "field": "day", "type": "ordinal", "sort": weekdays, "title": "time (day)" },
					"y": { "field": "distance", "type": "quantitative", "title": "distance" },
					"color": { "field": "activityType", "type": "nominal", "title": "Activity type" }
				}
			},
			{
				"description": "Mean activity distances by day of the week.",
				"transform": [{ "filter": "datum.displayMode === 'mean'" }],
				"mark": "point",
				"encoding": {
					"x": { "field": "day", "type": "ordinal", "sort": weekdays, "title": "time (day)" },
					"y": { "aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean of distance" },
					"color": { "field": "activityType", "type": "nominal", "title": "Activity type" }
				}
			}
		]
	};

	let showingMeans = false;
	let distanceView;
	const updateDistanceData = () => {
		if (distanceView) {
			const nextValues = showingMeans ? meanDistanceValues : rawDistanceValues;
			const changeSet = vega.changeset().remove(() => true).insert(nextValues);
			distanceView.change('distanceData', changeSet).run();
		}
	};
	vegaEmbed('#distanceVis', distanceSpec, { actions: false }).then(result => {
		distanceView = result.view;
		updateDistanceData();
	});

	const meansByActivity = topActivityTypes.map(activityType => {
		const values = distanceValues.filter(value => value.activityType === activityType);
		return { activityType, mean: values.reduce((sum, value) => sum + value.distance, 0) / values.length };
	});
	meansByActivity.sort((first, second) => second.mean - first.mean);
	document.getElementById('longestActivityType').innerText = meansByActivity[0]?.activityType || 'unknown';
	document.getElementById('shortestActivityType').innerText = meansByActivity.at(-1)?.activityType || 'unknown';

	const weekdayValues = distanceValues.filter(value => value.day !== 'Saturday' && value.day !== 'Sunday');
	const weekendValues = distanceValues.filter(value => value.day === 'Saturday' || value.day === 'Sunday');
	const averageDistance = values => values.length ? values.reduce((sum, value) => sum + value.distance, 0) / values.length : 0;
	document.getElementById('weekdayOrWeekendLonger').innerText = averageDistance(weekdayValues) >= averageDistance(weekendValues) ? 'weekdays' : 'weekends';

	const aggregateButton = document.getElementById('aggregate');
	aggregateButton.addEventListener('click', () => {
		showingMeans = !showingMeans;
		aggregateButton.innerText = showingMeans ? 'Show all activities' : 'Show means';
		updateDistanceData();
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});