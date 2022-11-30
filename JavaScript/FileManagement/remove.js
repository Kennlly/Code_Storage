const asyncRemoveFile = async (filePath) => {
	try {
		await fs.unlink(filePath);
		return true;
	} catch (err) {
		generalLogger.error(`asyncRemoveFile Func ${err}. Filepath = ${filePath}`);
		return false;
	}
};
