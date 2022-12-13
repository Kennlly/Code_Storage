const basicDELETEMethod = async (apiEndPoint) => {
	try {
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

			const isSucceed = response.ok;
			if (isSucceed) return true;

			const jsonResponse = await response.json();
			const errorMsg = jsonResponse.message;
			const errorCode = jsonResponse.status;
			generalLogger.error(
				`basicDELETEMethod Func - Requesting ERROR. Endpoint = ${apiEndPoint}. Response code = ${errorCode}. Error Msg = ${errorMsg}. Retrying on ${retryCounter} / 3.`
			);
			await forceProcessSleep(3000 * retryCounter);

			retryCounter++;
		} while (retryCounter <= 3);

		return false;
	} catch (err) {
		generalLogger.error(`basicDELETEMethod Func ${err}. APIEndPoint = ${apiEndPoint}.`);
		return false;
	}
};
