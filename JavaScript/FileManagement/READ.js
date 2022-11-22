import { promises as fs } from "fs";

const isFileExist = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

const readTXTFile = async (fileName) => {
	const filePath = `${TXT_FILEPATH}${fileName}.txt`;
	try {
		const isTXTFileExist = await isFileExist(filePath);
		if (!isTXTFileExist) {
			generalLogger.error(`File ${filePath} is NOT exist!`);
			await writeTXTFile(fileName, "");
			return "";
		}

		const data = await fs.readFile(filePath, "utf-8");
		return data;
	} catch (err) {
		generalLogger.error(`readTXTFile Func reading ${filePath} ${err}`);
		return false;
	}
};

const readJSONFile = async (fileName) => {
	const filePath = `${JSON_FILEPATH}${fileName}.json`;
	try {
		const isJSONFileExist = await isFileExist(filePath);
		if (!isJSONFileExist) {
			generalLogger.error(`File ${filePath} is NOT exist!`);
			await writeJSONFile(fileName, {});
			return {};
		}

		const data = await fs.readFile(filePath, "utf-8");
		try {
			return JSON.parse(data);
		} catch (err) {
			generalLogger.error(`Converting ${fileName}.json ${err}`);
		}
	} catch (err) {
		generalLogger.error(`readJSONFile Func reading ${filePath} ${err}`);
		return false;
	}
};

const asyncReadingFile = async (category, fileName) => {
	//handle writing txt or json file
	let filePath = -1;
	try {
		if (category !== "json" && category !== "txt") throw new Error(`Only input "json" or "txt" as reading file format!`);

		if (category === "json") {
			filePath = `${JSON_FILEPATH}${fileName}.${category}`;
			const isJSONFileExist = await isFileExist(filePath);
			if (!isJSONFileExist) {
				generalLogger.error(`File ${filePath} is NOT exist!`);
				await asyncWritingFile("json", fileName, {});
				return {};
			}
		} else {
			filePath = `${TXT_FILEPATH}${fileName}.${category}`;
			const isTXTFileExist = await isFileExist(filePath);
			if (!isTXTFileExist) {
				generalLogger.error(`File ${filePath} is NOT exist!`);
				await asyncWritingFile("txt", fileName, "");
				return "";
			}
		}

		const data = await fs.readFile(filePath, "utf-8");
		if (category === "txt") return data;

		try {
			return JSON.parse(data);
		} catch (err) {
			generalLogger.error(`Converting ${fileName}.${category} ${err}`);
		}
	} catch (err) {
		generalLogger.error(`asyncReadingFile Func ${err}`);
		return false;
	}
};
