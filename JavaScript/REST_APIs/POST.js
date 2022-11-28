const basicPOSTMethod = async (apiEndPoint, apiQueryBody) => {
	try {
		let errorCode = null;
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
				await forceProcessSleep(120000 * retryCounter);
			} else {
				generalLogger.error(
					`basicPOSTMethod Func - Looping ERROR. Endpoint = ${apiEndPoint}. Response code = ${errorCode}. Error Msg = ${errorMsg}. Retrying on ${retryCounter} / 3.\nApiQueryBody = ${JSON.stringify(
						apiQueryBody
					)}.`
				);
				await forceProcessSleep(3000 * retryCounter);
			}
			retryCounter++;
		} while (errorCode && errorCode !== 200 && retryCounter <= 3);

		generalLogger.error(`basicPOSTMethod Func ERROR after 3 times retries!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`basicPOSTMethod Func ${err}. ApiQueryBody = ${JSON.stringify(apiQueryBody)}.`);
		return false;
	}
};
