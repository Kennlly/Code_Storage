const getFileList = async (folderPath) => {
	try {
		const fileList = await fs.readdir(folderPath);
		if (fileList.length === 0) {
			generalLogger.info(`There is no files in the ${folderPath} folder.`);
			return false;
		}

		return fileList;
	} catch (err) {
		generalLogger.error(`getFileList Func ${err}`);
		return false;
	}
};
