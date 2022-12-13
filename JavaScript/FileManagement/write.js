const writeJSONFile = async (fileName, content) => {
	const filePath = `${JSON_FILEPATH}${fileName}.json`;
	try {
		await fs.writeFile(filePath, JSON.stringify(content, null, 2));
		generalLogger.info(`Writing ${fileName}.json SUCCEED!`);
		return true;
	} catch (err) {
		generalLogger.error(`Writing ${fileName}.json ${err}. Content = ${JSON.stringify(content)}`);
		return false;
	}
};

const writeTXTFile = async (fileName, content) => {
	const filePath = `${TXT_FILEPATH}${fileName}.txt`;
	try {
		await fs.writeFile(filePath, content);
		generalLogger.info(`Writing ${fileName}.txt SUCCEED!`);
		return true;
	} catch (err) {
		generalLogger.error(`Writing ${fileName}.txt ${err}. Content = ${content}`);
		return false;
	}
};

const asyncWritingFile = async (category, fileName, content) => {
	//handle writing txt or json file
	if (category !== "json" && category !== "txt") throw new Error(`Only input "json" or "txt" as writing file format!`);

	const filePath = `${INFO_FILEPATH}${fileName}.${category}`;
	const fileContent = category === "json" ? JSON.stringify(content, null, 2) : content;
	try {
		await fs.writeFile(filePath, fileContent);
		return true;
	} catch (err) {
		generalLogger.error(
			`asyncWritingFile Func ${err}. Category = ${category}. FileName = ${fileName}. Content = ${JSON.stringify(content)}`
		);
		return false;
	}
};
