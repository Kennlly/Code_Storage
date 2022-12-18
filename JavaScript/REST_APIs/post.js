//npm node-fetch
import fetch from "node-fetch";

const basicPOSTMethod = async (apiEndPoint, apiQueryBody) => {
	try {
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();

			const response = await fetch(apiEndPoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
				body: JSON.stringify(apiQueryBody),
			});

			const isSucceed = response.ok;
			const jsonResponse = await response.json();
			if (isSucceed) return jsonResponse;

			const errorMsg = jsonResponse.message;
			const errorCode = jsonResponse.status;
			if (errorCode === 429) {
				generalLogger.warn(`basicPOSTMethod Func - Requesting too frequently. Retrying on ${retryCounter} / 3.`);
				await forceProcessSleep(120000 * retryCounter);
			} else {
				generalLogger.error(
					`basicPOSTMethod Func - Requesting ERROR. Endpoint = ${apiEndPoint}. Response code = ${errorCode}. Error Msg = ${errorMsg}. Retrying on ${retryCounter} / 3.\nApiQueryBody = ${JSON.stringify(
						apiQueryBody
					)}.`
				);
				await forceProcessSleep(3000 * retryCounter);
			}
			retryCounter++;
		} while (retryCounter <= 3);

		throw new Error("ERROR after 3 times retries!");
	} catch (err) {
		generalLogger.error(
			`basicPOSTMethod Func ${err}. APIEndPoint = ${apiEndPoint}, ApiQueryBody = ${JSON.stringify(apiQueryBody)}.`
		);
		return false;
	}
};

// Genesys limits a total of 100,000 records as per payload, so we need to check and adjust the query interval
const getPOSTMethodQueryTotal = async (category, queryInterval, agentID = null) => {
	const queryNote = `Category = ${category}, Query Interval = ${queryInterval}, AgentID = ${agentID}`;
	try {
		const apiEndPoint =
			category === "Conversation"
				? `${GENESYS_ENDPOINT_URL}/api/v2/analytics/conversations/details/query`
				: `${GENESYS_ENDPOINT_URL}/api/v2/analytics/users/details/query`;
		const apiQueryBody = agentID
			? {
					interval: queryInterval,
					userFilters: [
						{
							type: "and",
							predicates: [
								{
									type: "dimension",
									dimension: "userId",
									operator: "matches",
									value: agentID,
								},
							],
						},
					],
			  }
			: {
					interval: queryInterval,
			  };

		const data = await basicPOSTMethod(apiEndPoint, apiQueryBody);
		if (!data) {
			generalLogger.error(`getPOSTMethodQueryTotal Func - Requesting API ERROR! ${queryNote}`);
			return false;
		}
		return data.totalHits;
	} catch (err) {
		generalLogger.error(`getPOSTMethodQueryTotal Func ${err}. ${queryNote}`);
		return false;
	}
};

const definePOSTMethodQueryIntervals = async (category, initialInterval, agentID = null) => {
	/*There are two rules for Genesys POST conversation/user detail interval API
	1. interval MUST be within 7 days
	2. totalHits for the interval cannot be exceed 100,000
	*/
	try {
		const initialIntervalArr = initialInterval.split("/");
		const initialStartTime = moment.utc(initialIntervalArr[0]);
		const initialEndTime = moment.utc(initialIntervalArr[1]);
		const initialTimeDiff = initialEndTime.diff(initialStartTime, "day");
		if (initialTimeDiff <= 7) {
			const initialTotalCnt = await getPOSTMethodQueryTotal(category, initialInterval, agentID);
			if (initialTotalCnt <= 100000) return [initialInterval];

			generalLogger.info(`Define POST method query intervals function triggered. Initial Interval = ${initialInterval}.`);
			let intervalResult = [];
			let forwardingStartTime = initialStartTime.clone();
			while (forwardingStartTime < initialEndTime) {
				//because within 7 days, we use timeDiff to define the forwarding endTime
				let adjustingTimeDiff = initialEndTime.diff(forwardingStartTime);
				let forwardingEndTime = forwardingStartTime.clone().add(adjustingTimeDiff);
				let forwardingStartTimeStr = forwardingStartTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
				let forwardingEndTimeStr = forwardingEndTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
				let queryInterval = `${forwardingStartTimeStr}/${forwardingEndTimeStr}`;
				let tempTotalCnt = await getPOSTMethodQueryTotal(category, queryInterval, agentID);
				if (tempTotalCnt <= 100000) {
					intervalResult.push(queryInterval);
					forwardingStartTime = forwardingEndTime.clone();
				} else {
					while (tempTotalCnt > 100000) {
						adjustingTimeDiff = forwardingEndTime.diff(forwardingStartTime) / 2;
						forwardingEndTime = forwardingStartTime.clone().add(adjustingTimeDiff);
						forwardingEndTimeStr = forwardingEndTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
						queryInterval = `${forwardingStartTimeStr}/${forwardingEndTimeStr}`;
						tempTotalCnt = await getPOSTMethodQueryTotal(category, queryInterval, agentID);
					}
					intervalResult.push(queryInterval);
					forwardingStartTime = forwardingEndTime.clone();
				}
			}
			generalLogger.info(
				`Define POST method query intervals function finished. Interval result = ${JSON.stringify(intervalResult)}.`
			);
			return intervalResult;
		}

		generalLogger.info(`Define POST method query intervals function triggered. Initial Interval = ${initialInterval}.`);
		let intervalResult = [];
		let forwardingStartTime = initialStartTime.clone();
		while (forwardingStartTime < initialEndTime) {
			//because it exceeds 7 days, we use endTime to define the timeDiff
			let forwardingEndTime =
				forwardingStartTime.clone().add(7, "day") <= initialEndTime
					? forwardingStartTime.clone().add(7, "day")
					: initialEndTime;
			let adjustingTimeDiff = forwardingEndTime.diff(forwardingStartTime);
			let forwardingStartTimeStr = forwardingStartTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
			let forwardingEndTimeStr = forwardingEndTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
			let queryInterval = `${forwardingStartTimeStr}/${forwardingEndTimeStr}`;
			let tempTotalCnt = await getPOSTMethodQueryTotal(category, queryInterval, agentID);
			if (tempTotalCnt <= 100000) {
				intervalResult.push(queryInterval);
				forwardingStartTime = forwardingEndTime.clone();
			} else {
				while (tempTotalCnt > 100000) {
					adjustingTimeDiff = forwardingEndTime.diff(forwardingStartTime) / 2;
					forwardingEndTime = forwardingStartTime.clone().add(adjustingTimeDiff);
					forwardingEndTimeStr = forwardingEndTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
					queryInterval = `${forwardingStartTimeStr}/${forwardingEndTimeStr}`;
					tempTotalCnt = await getPOSTMethodQueryTotal(category, queryInterval, agentID);
				}
				intervalResult.push(queryInterval);
				forwardingStartTime = forwardingEndTime.clone();
			}
		}
		generalLogger.info(
			`Define POST method query intervals function finished. Interval result = ${JSON.stringify(intervalResult)}.`
		);
		return intervalResult;
	} catch (err) {
		generalLogger.error(
			`definePOSTMethodQueryIntervals Func ${err}. Category = ${category}, Initial interval = ${initialInterval}, AgentID = ${agentID}.`
		);
		return false;
	}
};
