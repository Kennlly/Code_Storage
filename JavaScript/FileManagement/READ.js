import { promises as fs } from "fs";

const isFileExist = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

const readTXTFile = async (isRecovery, timeStamp) => {
	let filePath = isRecovery ? `${ERROR_FILEPATH}${timeStamp}.txt` : `${DATAFEEDRECORD_FILEPATH}${timeStamp}.txt`;
	try {
		const isTXTFileExist = await isFileExist(filePath);
		if (!isTXTFileExist) return undefined;

		const data = await fs.readFile(filePath, "utf-8");
		return data;
	} catch (err) {
		generalLogger.error(`readTXTFile Func reading ${filePath} ${err}`);
		return false;
	}
};

const readJSONFile = async (category, timestamp) => {
	const filePath = `${DATASTORAGE_FILEPATH}${category}${path.sep}${timestamp}_DBResult.json`;
	try {
		const isJSONFileExist = await isFileExist(filePath);
		if (!isJSONFileExist) {
			throw new Error(`File ${category}-${timestamp} is NOT exist!`);
		}

		const data = await fs.readFile(filePath, "utf-8");
		try {
			return JSON.parse(data);
		} catch (err) {
			generalLogger.error(`Converting ${fileName}.json ${err}`);
			return false;
		}
	} catch (err) {
		recoverLogger.error(`readJSONFile Func ${err}. Filepath = ${filePath}`);
		return false;
	}
};
