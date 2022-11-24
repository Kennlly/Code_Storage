const basicPOSTMethod = async (apiEndPoint, apiQueryBody) => {
	try {
		let responseCode = null;
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
			const data = await response.json();
			if (!data.status) return data;

			responseCode = data.status;
			generalLogger.error(
				`basicPOSTMethod Func - Looping ERROR. Endpoint = ${apiEndPoint}. Response code = ${responseCode}. Error Msg = ${data.message}. Retrying on ${retryCounter} / 3.`
			);
			if (responseCode === 429) {
				await forceProcessSleep(60000 * retryCounter);
			} else {
				await forceProcessSleep(3000 * retryCounter);
			}
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`basicPOSTMethod Func ERROR after 3 times retries!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`basicPOSTMethod Func ${err}`);
		return false;
	}
};
