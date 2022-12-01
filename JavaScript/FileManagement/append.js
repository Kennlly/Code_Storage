const asyncAppendFile = async (content) => {
	const fileNameTimestamp = moment().format("YYYY-MM-DDTHHmmss");
	const filePath = `${DATASTORAGE_FILEPATH}${fileNameTimestamp}.txt`;
	try {
		await fs.asyncAppendFile(filePath, content);
		return true;
	} catch (err) {
		generalLogger.error(`asyncAppendFile Func ${fileNameTimestamp}.txt ${err}. Content = ${content}`);
		return false;
	}
};
