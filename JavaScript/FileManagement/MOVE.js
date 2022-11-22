const moveFile = async (isRecovery, isPOSTSucceed, timestamp) => {
	try {
		const oldPath = isRecovery ? `${ERROR_FILEPATH}${timestamp}.txt` : `${DATAFEEDRECORD_FILEPATH}${timestamp}.txt`;
		const newPath = isPOSTSucceed ? `${ARCHIVE_FILEPATH}${timestamp}.txt` : `${ERROR_FILEPATH}${timestamp}.txt`;
		await fs.rename(oldPath, newPath);
		return true;
	} catch (err) {
		generalLogger.error(`moveFile Func ${err}`);
		return false;
	}
};
