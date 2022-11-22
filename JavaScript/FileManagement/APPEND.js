const appendFile = async (content) => {
	const fileNameTimestamp = moment().format("YYYY-MM-DDTHHmmss");
	const filePath = `${DATASTORAGE_FILEPATH}${fileNameTimestamp}.txt`;
	try {
		await fs.appendFile(filePath, content);
		return true;
	} catch (err) {
		generalLogger.error(`Appending ${fileNameTimestamp}.txt ${err}. Content = ${content}`);
		return false;
	}
};
