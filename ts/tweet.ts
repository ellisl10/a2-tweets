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
        const match = this.text.match(/^Just (?:completed|posted) an? (?:(?:[\d.]+)\s*(?:km|mi)\s+)?(.+?)(?=\s+(?:with @Runkeeper\b|[-–]\s|in \d|https?:\/\/)|\s+#Runkeeper|$)/i);
        return match ? match[1].trim().toLowerCase() : "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(/^Just (?:completed|posted) an? ([\d.]+)\s*(km|mi)\b/i);
        if (!match) {
            return 0;
        }

        const distance = Number(match[1]);
        return match[2].toLowerCase() === "km" ? distance / 1.609 : distance;
    }

    getHTMLTableRow(rowNumber:number):string {
        const escapeHTML = (value:string):string => value.replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character] || character);
        let lastIndex = 0;
        const linkedParts:string[] = [];
        const urlPattern = /https?:\/\/\S+/g;
        let match:RegExpExecArray | null;
        while ((match = urlPattern.exec(this.text)) !== null) {
            linkedParts.push(escapeHTML(this.text.slice(lastIndex, match.index)));
            const safeURL = escapeHTML(match[0]);
            linkedParts.push(`<a href="${safeURL}" target="_blank" rel="noopener noreferrer">${safeURL}</a>`);
            lastIndex = match.index + match[0].length;
        }
        linkedParts.push(escapeHTML(this.text.slice(lastIndex)));
        const linkedText = linkedParts.join("");
        return `<tr><td>${rowNumber}</td><td>${escapeHTML(this.activityType)}</td><td>${linkedText}</td></tr>`;
    }
}