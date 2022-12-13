const basicDELETEMethod = async (apiEndPoint) => {
	try {
		let responseCode = null;
		let retryCounter = 1;

		do {
			const genesysToken = await generateValidToken();
			const response = await fetch(apiEndPoint, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
			});

			responseCode = response.status;

			if (responseCode === 200) return true;

			await forceProcessSleep(3000 * retryCounter);
			generalLogger.error(
				`basicDELETEMethod Func - Looping ERROR. Endpoint = ${apiEndPoint}. Response code = ${responseCode}. Error Msg = ${response.statusText}. Retrying on ${retryCounter} / 3 time.`
			);
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`basicDELETEMethod Func ERROR after 3 times retries!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`basicDELETEMethod Func ${err}`);
		return false;
	}
};
