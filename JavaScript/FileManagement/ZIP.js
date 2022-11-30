// npm i adm-zip
import AdmZip from "adm-zip";

const zipLogFiles = async (logCategory) => {
	const zip = new AdmZip();
	try {
		const folderPath = `${LOG_FILEPATH}${logCategory}${path.sep}`;
		const fileListArr = await getFileList(folderPath);
		const backwardOneMonthDateStr = moment().subtract(1, "month").format("YYYY-MM");
		const filteredResult = fileListArr.filter((fileName) => {
			const fileDate = fileName.split(".")[0];
			const fileYearMonthStr = moment(fileDate, "YYYY-MM-DD", true).format("YYYY-MM");
			return fileYearMonthStr === backwardOneMonthDateStr;
		});
		if (filteredResult.length === 0) {
			generalLogger.info(`There is no log files - ${logCategory} for ${backwardOneMonthDateStr} to be zipped.`);
			return true;
		}

		//Generate zip folder
		filteredResult.forEach((file) => zip.addLocalFile(`${folderPath}${file}`));
		zip.writeZip(`${folderPath}${backwardOneMonthDateStr}.zip`);

		//Remove the files
		filteredResult.forEach(async (file) => {
			const result = await removeFile(`${folderPath}${file}`);
			if (!result) generalLogger.error(`Remove file ${folderPath}${file} occurs error!`);
		});

		generalLogger.info(`Zip and Remove files for log files - ${logCategory} for ${backwardOneMonthDateStr} COMPLETED!`);
		return true;
	} catch (err) {
		generalLogger.error(`zipLogFiles Func ${err}. LogCategory = ${logCategory}`);
		return false;
	}
};
