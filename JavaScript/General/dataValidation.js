import { modelLogger } from "./loggerConfig.js";
import moment from "moment";

const isRequiredParam = (columnName) => {
	throw new Error(`Param is required for ${columnName}`);
};

const validateStr = (
	sourceData,
	isValidatingID = isRequiredParam("isValidatingID"),
	expectedLength = isRequiredParam("expectedLength"),
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	try {
		if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

		if (isValidatingID) {
			if (sourceData.length === expectedLength) return sourceData;

			throw new Error("Error data - Problem String(NOT UUID)");
		}

		const validatingStr = sourceData.replace(/'/g, "''").replace(/\n/g, " ");
		if (validatingStr.length <= expectedLength) return validatingStr;

		modelLogger.error(`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem String = ${sourceData}.`);
		return validatingStr.substring(0, expectedLength);
	} catch (err) {
		modelLogger.error(
			`validateStr Func ${err}. SourceData = ${sourceData}, ColumnName = ${columnName}, PrimaryKeyNote = ${primaryKeyNote}.`
		);
		return null;
	}
};

//To confirm the interger fullfil the SQL servel INT datatype
const validateMsSQLInt = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	try {
		if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

		const isNumber = isNaN(sourceData) === false;
		if (sourceData >= 0 && sourceData <= 2147483647 && isNumber) return sourceData;

		throw new Error(`Error data - Problem Integer(It's NOT a MsSQL INT)`);
	} catch (err) {
		modelLogger.error(
			`validateMsSQLInt Func ${err}. SourceData = ${sourceData}, ColumnName = ${columnName}, PrimaryKeyNote = ${primaryKeyNote}.`
		);
		return null;
	}
};

//If we known datasource may exceed MsSQL INT type, we just validate if it is a number
const validateNumber = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	try {
		if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

		const isNumber = isNaN(sourceData) === false;
		if (isNumber) return sourceData;

		throw new Error("Error data");
	} catch (err) {
		modelLogger.error(
			`validateNumber Func ${err}. SourceData = ${sourceData}, ColumnName = ${columnName}, PrimaryKeyNote = ${primaryKeyNote}.`
		);
		return null;
	}
};

const validateBool = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	try {
		if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

		if (typeof sourceData === "boolean") return sourceData;

		throw new Error(`Error data - Problem String(NOT Boolean)`);
	} catch (err) {
		modelLogger.error(
			`validateBool Func ${err}. SourceData = ${sourceData}, ColumnName = ${columnName}, PrimaryKeyNote = ${primaryKeyNote}.`
		);
		return null;
	}
};

const validateDate = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	try {
		if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

		// Cannot use moment strict mode
		// const parseMomentDateStr = moment(sourceData, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true);
		const parseMomentDateStr = moment(sourceData, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
		const isValidDateStr = parseMomentDateStr.isValid();
		if (isValidDateStr) return sourceData;

		throw new Error("Error data");
	} catch (err) {
		modelLogger.error(
			`validateDate Func ${err}. SourceData = ${sourceData}, ColumnName = ${columnName}, PrimaryKeyNote = ${primaryKeyNote}.`
		);
		return null;
	}
};

export { validateStr, validateMsSQLInt, validateNumber, validateBool, validateDate };
