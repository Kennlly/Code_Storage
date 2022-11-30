const copyFile = async (isRecovery, isPOSTSucceed, timestamp) => {
	try {
		if (isRecovery) return;

		const oldPath = `${DATAFEEDRECORD_FILEPATH}${timestamp}.txt`;
		const newPath = isPOSTSucceed ? `${ARCHIVE_FILEPATH}${timestamp}.txt` : `${ERROR_FILEPATH}${timestamp}.txt`;
		await fs.copyFile(oldPath, newPath);
		return true;
	} catch (err) {
		generalLogger.error(`copyFile Func ${err}`);
		return false;
	}
};
