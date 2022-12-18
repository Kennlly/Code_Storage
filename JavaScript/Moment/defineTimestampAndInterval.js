const defineStartEndTime = async (interval, timestampRecordFileName) => {
	const funcNote = `Initial interval = ${interval}, timestampRecordFileName = ${timestampRecordFileName}.`;
	try {
		if (interval && timestampRecordFileName)
			throw new Error("Interval and Timestamp record file name should NOT be provided at the same time");

		if (!interval) {
			let tempStartTimeStr = await asyncReadingFile("txt", timestampRecordFileName);
			const tempEndTime = moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
			const adjustedEndTimeStr = backwardTimestamp(tempEndTime);
			const momentAdjustedEndTime = moment.utc(adjustedEndTimeStr, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true);
			if (!tempStartTimeStr) {
				tempStartTimeStr = momentAdjustedEndTime.clone().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
			}
			await asyncWritingFile("txt", timestampRecordFileName, adjustedEndTimeStr);
			return defineStartEndTime(`${tempStartTimeStr}/${adjustedEndTimeStr}`);
		}

		let adjustedStartTime = -1;
		let adjustedEndTime = -1;
		const initialTimeArr = interval.split("/");
		const momentInitialStartTime = moment.utc(initialTimeArr[0], "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true);
		const momentInitialEndTime = moment.utc(initialTimeArr[1], "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true);
		const initialTimeDiff = momentInitialEndTime.diff(momentInitialStartTime, "minute");
		adjustedStartTime = backwardTimestamp(initialTimeArr[0]);
		adjustedEndTime = initialTimeDiff >= 30 ? backwardTimestamp(initialTimeArr[1]) : forwardTimestamp(initialTimeArr[1]);

		return { adjustedStartTime, adjustedEndTime };
	} catch (err) {
		generalLogger.error(`defineStartEndTime Func ${err}. ${funcNote}`);
		return false;
	}
};

const backwardTimestamp = (timestamp) => {
	try {
		if (!timestamp) throw new Error(`Parameter "timeStamp" is Required`);
		const timestampArr = timestamp.split("T");
		const dateStr = timestampArr[0];
		const timeArr = timestampArr[1].split(":");
		const hourStr = timeArr[0];
		const minute = Number(timeArr[1]);
		const minuteStr = minute >= 30 ? "30" : "00";
		return `${dateStr}T${hourStr}:${minuteStr}:00.000Z`;
	} catch (err) {
		generalLogger.error(`backwardTimestamp Func ${err}. Timestamp = ${timestamp}.`);
		return false;
	}
};

const forwardTimestamp = (timestamp) => {
	try {
		if (!timestamp) throw new Error(`Parameter "timeStamp" is Required`);
		const forwardHalfHourStr = moment
			.utc(timestamp, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true)
			.clone()
			.add(30, "minute")
			.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
		return backwardTimestamp(forwardHalfHourStr);
	} catch (err) {
		generalLogger.error(`forwardTimestamp Func ${err}. Timestamp = ${timestamp}.`);
		return false;
	}
};

const adjustIntervalAsQuarter = (startTimestamp, endTimestamp) => {
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
			if (forwardingEndTime >= momentEndTime) {
				const farwordingStartTimeStr = forwardingStartTime.format("YYYY-MM-DD HH:mm");
				definedIntervalArr.push(`${farwordingStartTimeStr}/${endTimestamp}`);
			}
		}

		return definedIntervalArr;
	} catch (err) {
		generalLogger.error(
			`adjustIntervalAsQuarter Func ${err}. Starttimestamp = ${startTimestamp}, Endtimestamp = ${endTimestamp}`
		);
		return false;
	}
};
