const defineQueryEndTimestamp = (endTimestamp) => {
	try {
		let dateStr = -1;
		let timeStrArr = -1;
		if (endTimestamp) {
			const timestampArr = endTimestamp.split("T");
			dateStr = timestampArr[0];
			timeStrArr = timestampArr[1].split(":");
		} else {
			dateStr = moment.utc().format("YYYY-MM-DD");
			const timeStr = moment.utc().format("HH:mm:ss");
			timeStrArr = timeStr.split(":");
		}
		const hourStr = timeStrArr[0];
		const minuteInNumber = Number(timeStrArr[1]);
		if (minuteInNumber >= 30) return `${dateStr}T${hourStr}:30:00.000Z`;
		return `${dateStr}T${hourStr}:00:00.000Z`;
	} catch (err) {
		SALogger.error(`defineQueryEndTimestamp Func ${err}. Endtimestamp = ${endTimestamp}`);
		return false;
	}
};

const defineQueryStartTimestamp = async (timestamp) => {
	try {
		if (timestamp) return defineQueryEndTimestamp(timestamp);

		const fileTimestamp = await asyncReadingFile("txt", "lastSATimestamp");
		if (fileTimestamp === "") {
			const endTimestamp = defineQueryEndTimestamp();
			const startTimestamp = moment.utc(endTimestamp).clone().subtract(30, "minute").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
			return startTimestamp;
		}

		const result = defineQueryEndTimestamp(fileTimestamp);
		return result;
	} catch (err) {
		SALogger.error(`defineQueryStartTimestamp Func ${err}. Starttimestamp = ${timestamp}`);
		return false;
	}
};

//The last interval is in half-hour even greater than the original endTimestamp
const defineIntervalAsHalfHour = (startTimestamp, endTimestamp) => {
	//The start and end timestamp have already been adjusted to ??:00:00 or ??:30:00
	try {
		const momentStartTime = moment(startTimestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
		const momentEndTime = moment(endTimestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
		const timeDiff = moment(momentEndTime).diff(momentStartTime, "minute");
		if (timeDiff <= 30) return [`${startTimestamp}/${endTimestamp}`];

		let forwardingStartTime = momentStartTime.clone();
		let definedIntervalArr = [];
		while (forwardingStartTime < momentEndTime) {
			const forwardingEndTime = forwardingStartTime.clone().add(30, "minute");
			const startTimeStr = forwardingStartTime.format("YYYY-MM-DDTHH:mm");
			const endTimeStr = forwardingEndTime.format("YYYY-MM-DDTHH:mm");
			definedIntervalArr.push(`${startTimeStr}:00.000Z/${endTimeStr}:00.000Z`);
			forwardingStartTime = forwardingEndTime;
		}
		return definedIntervalArr;
	} catch (err) {
		SALogger.error(`defineIntervalAsHalfHour Func ${err}. Starttimestamp = ${startTimestamp}, Endtimestamp = ${endTimestamp}`);
		return false;
	}
};

//The last interval is lastForwardingStartTime till the origianl endTimestamp
const defineIntervalAsQuater = (startTimestamp, endTimestamp) => {
	try {
		const momentStartTime = moment(startTimestamp, "YYYY-MM-DD HH:mm");
		const momentEndTime = moment(endTimestamp, "YYYY-MM-DD HH:mm");
		const timeDiff = moment(momentEndTime).diff(momentStartTime, "minute");
		if (timeDiff <= 15) return [`${startTimestamp}/${endTimestamp}`];

		let forwardingStartTime = momentStartTime.clone();
		let forwardingEndTime = forwardingStartTime.clone().add(15, "minute");
		let definedIntervalArr = [];
		while (forwardingEndTime < momentEndTime) {
			const startTimeStr = forwardingStartTime.format("YYYY-MM-DD HH:mm");
			const endTimeStr = forwardingEndTime.format("YYYY-MM-DD HH:mm");
			definedIntervalArr.push(`${startTimeStr}/${endTimeStr}`);
			forwardingStartTime = forwardingEndTime;
			forwardingEndTime = forwardingStartTime.clone().add(15, "minute");
		}

		const farwordingStartTimeStr = forwardingStartTime.format("YYYY-MM-DD HH:mm");
		definedIntervalArr.push(`${farwordingStartTimeStr}/${endTimestamp}`);
		return definedIntervalArr;
	} catch (err) {
		generalLogger.error(
			`defineIntervalAsQuater Func ${err}. Starttimestamp = ${startTimestamp}, Endtimestamp = ${endTimestamp}`
		);
		return false;
	}
};
