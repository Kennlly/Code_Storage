//npm i easy-soap-request
import soapRequest from "easy-soap-request";
import { RTA_ENDPOINT, SOAP_ACTION } from "../utils/constants.js";

const postData = async (isRecovery, xmlPayload) => {
	try {
		let responseCode = -1;
		let retryCounter = 1;
		do {
			try {
				const postHeader = {
					// "user-agent": "sampleTest",
					"Content-Type": "text/xml;charset=UTF-8",
					SOAPAction: SOAP_ACTION,
				};
				const { response } = await soapRequest({ url: RTA_ENDPOINT, headers: postHeader, xml: xmlPayload, timeout: 5000 }); // Optional timeout parameter(milliseconds)
				const { headers, body, statusCode } = response;
				responseCode = statusCode;
				if (responseCode === 200) return true;
			} catch (err) {
				responseCode = err.response.status;
				if (isRecovery) {
					recoverLogger.error(
						`postData Func - looping ERROR! Response Code = ${responseCode}. Msg = ${err.response.statusText}. Retrying ${retryCounter} / 3 times.`
					);
				} else {
					generalLogger.error(
						`postData Func - looping ERROR! Response Code = ${responseCode}. Msg = ${err.response.statusText}. Retrying ${retryCounter} / 3 times.`
					);
				}
				await forceProcessSleep(10000 * retryCounter);
				retryCounter++;
			}
		} while (responseCode !== 200 && retryCounter <= 3);

		if (responseCode === 200) return true;

		if (isRecovery) {
			recoverLogger.error(`postData Func - ERROR after 3 times retries. xmlPayload = ${xmlPayload}`);
		} else {
			generalLogger.error(`postData Func - ERROR after 3 times retries. xmlPayload = ${xmlPayload}`);
		}
		return false;
	} catch (err) {
		if (isRecovery) {
			recoverLogger.error(`postData Func ${err}`);
		} else {
			generalLogger.error(`postData Func ${err}`);
		}
		return false;
	}
};
