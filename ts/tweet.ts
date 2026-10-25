class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const normalizedText = this.text.toLowerCase();
        if (this.text.startsWith("Watch my")) {
            return "live_event";
        }
        if (normalizedText.startsWith("achieved a new personal record") ||
            normalizedText.startsWith("i just set a goal") ||
            normalizedText.includes("new pb") ||
            normalizedText.includes("new fastest") ||
            normalizedText.includes("farthest distance")) {
            return "achievement";
        }
        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.userWrittenText.length > 0;
    }

    get writtenText():string {
        return this.userWrittenText;
    }

    private get userWrittenText():string {
        const cleanedText = this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#Runkeeper\b/gi, "")
            .trim();
        const match = cleanedText.match(/^Just (?:completed|posted) a .+?\s+-\s+([\s\S]*)$/);
        if (!match) {
            return "";
        }

        const writtenText = match[1]
            .replace(/\s+with @Runkeeper\. Check it out!$/i, "")
            .trim();
        return writtenText === "TomTom MySports Watch" ? "" : writtenText;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}