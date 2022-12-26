//npm node-fetch
import fetch from "node-fetch";

const basicGETMethod = async (apiEndPoint) => {
	try {
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();

			const response = await fetch(apiEndPoint, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
			});

			const isSucceed = response.ok;
			const jsonResponse = await response.json();
			if (isSucceed) return jsonResponse;

			const errorMsg = jsonResponse.message;
			const errorCode = jsonResponse.status;
			if (errorCode === 403) {
				throw new Error(`Response code = ${errorCode}. Error Msg = ${errorMsg}`);
			} else if (errorCode === 429) {
				generalLogger.warn(`basicGETMethod Func - Requesting too frequently. Retrying on ${retryCounter} / 3.`);
				await forceProcessSleep(120000 * retryCounter);
			} else {
				generalLogger.error(
					`basicGETMethod Func - Requesting ERROR. Endpoint = ${apiEndPoint}. Response code = ${errorCode}. Error Msg = ${errorMsg}. Retrying on ${retryCounter} / 3.`
				);
				await forceProcessSleep(3000 * retryCounter);
			}
			retryCounter++;
		} while (retryCounter <= 3);

		throw new Error("ERROR after 3 times retries!");
	} catch (err) {
		generalLogger.error(`basicGETMethod Func ${err} APIEndPoint = ${apiEndPoint}`);
		return false;
	}
};

const getMethodLookupModel = async (apiEndPoint) => {
	let genesysPayload = -1;

	try {
		const data = await basicGETMethod(apiEndPoint);
		if (!data) return false;

		genesysPayload = data;
		if (JSON.stringify(genesysPayload) === "{}" || genesysPayload.entities.length === 0) return false;
		let fullPayload = genesysPayload.entities;

		//Sometimes payload exceed one page
		while (genesysPayload.nextUri) {
			try {
				const fullURL = `${GENESYS_ENDPOINT_URL}${genesysPayload.nextUri}`;
				const data = await basicGETMethod(fullURL);
				if (!data) return false;

				fullPayload.push(data.entities);
				fullPayload = fullPayload.flat();
				genesysPayload = data;
			} catch (err) {
				LookupsLogger.error(`getMethodLookupModel Func - Requesting "nextUri" ${err}. API endpoint = ${fullURL}`);
				return false;
			}
		}
		return fullPayload;
	} catch (err) {
		LookupsLogger.error(`getMethodLookupModel Func ${err}. API endpoint = ${apiEndPoint}`);
		return false;
	}
};
