// npm i adm-zip
import AdmZip from "adm-zip";

const zipLogFiles = async (logCategory) => {
	const zip = new AdmZip();
	try {
		const folderPath = `${LOG_FILEPATH}${logCategory}${path.sep}`;
		const fileListArr = await getFileList(folderPath);
		if (!fileListArr) return true;

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

		return true;
	} catch (err) {
		generalLogger.error(`zipLogFiles Func ${err}. LogCategory = ${logCategory}`);
		return false;
	}
};

const zipDataStorageFiles = async (category) => {
	const zip = new AdmZip();
	try {
		const folderPath = `${DATASTORAGE_FILEPATH}${category}${path.sep}`;
		const fileListArr = await getFileList(folderPath);
		if (!fileListArr) return true;

		const backwardSevenDaysTimestamp = moment().subtract(7, "day").format("YYYY-MM-DD");
		const filteredResult = fileListArr.filter((fileName) => {
			const index = fileName.indexOf("T");
			const fileDate = fileName.substring(0, index);
			const isValidFileDate = moment(fileDate, "YYYY-MM-DD", true).isValid();
			if (isValidFileDate) return fileDate === backwardSevenDaysTimestamp;
		});

		if (filteredResult.length === 0) {
			generalLogger.info(`There is no data storage - ${category} files for ${backwardSevenDaysTimestamp} to be zipped.`);
			return true;
		}

		//Generate zip folder
		filteredResult.forEach((file) => zip.addLocalFile(`${folderPath}${file}`));
		zip.writeZip(`${folderPath}${backwardSevenDaysTimestamp}.zip`);

		//Remove the files
		filteredResult.forEach(async (file) => {
			const result = await removeFile(`${folderPath}${file}`);
			if (!result) generalLogger.error(`Remove file ${folderPath}${file} occurs error!`);
		});
		return true;
	} catch (err) {
		generalLogger.error(`zipDataStorageFiles Func ${err}. Category = ${category}`);
		return false;
	}
};
