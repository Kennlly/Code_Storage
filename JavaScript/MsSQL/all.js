//npm i mssql
import sql from "mssql";
// import { generalLogger } from "./loggerConfig.js";
// import { SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER } from "./constants.js";
// import { forceProcessSleep } from "./generalAPIMethods.js";

const { ConnectionPool } = sql;
let pools = {};

const isPoolExist = (poolName) => {
	if (!Object.prototype.hasOwnProperty.call(pools, poolName)) return false;
	return true;
};

const createPool = async (poolName) => {
	try {
		const config = {
			server: SQL_SERVER,
			user: SQL_USER,
			password: SQL_PASSWORD,
			database: SQL_DATABASE,
			options: { enableArithAbort: true, trustServerCertificate: true, encrypt: true },
			connectionTimeout: 300000,
			requestTimeout: 300000,
			pool: {
				max: 20,
				min: 0,
				idleTimeoutMillis: 300000,
			},
		};

		let poolExistResult = isPoolExist(poolName);
		let counter = 0;
		let newPoolName = poolName;

		while (poolExistResult) {
			counter++;
			newPoolName = `${poolName}_${counter}`;
			poolExistResult = isPoolExist(newPoolName);
		}

		let retryCounter = 1;
		do {
			try {
				const connectionResult = await new ConnectionPool(config).connect();
				return (pools[newPoolName] = {
					poolName: newPoolName,
					poolInfo: connectionResult,
				});
			} catch (err) {
				generalLogger.error(`createPool Func - looping ${err}. Retrying on ${retryCounter} / 3.`);
				await forceProcessSleep(10000 * retryCounter);
				retryCounter++;
			}
		} while (retryCounter <= 3);

		throw new Error("Connection ERROR after 3 times retries!");
	} catch (err) {
		generalLogger.error(`createPool Func ${err}`);
		return false;
	}
};

const closePool = async (name) => {
	try {
		const poolExistResult = isPoolExist(name);
		if (!poolExistResult) return;

		const pool = pools[name].poolInfo;
		delete pools[name];
		const result = await pool.close();
		if (result._connecting === false) return true;

		throw new Error("Database close ERROR!");
	} catch (err) {
		generalLogger.error(`closePool Func ${err} Pool Name = ${name}`);
		return false;
	}
};

const basicDBQuery = async (databasePoolInfo, databaseQuery) => {
	try {
		const result = await databasePoolInfo.query(databaseQuery);
		return result;
	} catch (err) {
		generalLogger.error(`basicDBQuery Func ${err}. Query value = ${JSON.stringify(databaseQuery)}`);
		return false;
	}
};

const parseJSONIntoDB = async (databasePoolInfo, procedureName, queryValue) => {
	try {
		const databaseQuery = `EXEC ${procedureName} @genesysPayload = N'${JSON.stringify(queryValue)}'`;
		const result = await databasePoolInfo.query(databaseQuery);
		if (result.recordset[0].hasOwnProperty("Succeed")) return true;

		throw new Error(`Error msg from database: ${result.recordset[0].ErrorMsg}.`);
	} catch (err) {
		generalLogger.error(
			`parseJSONIntoDB Func ${err} ProcedureName = ${procedureName}. Query Value = ${JSON.stringify(queryValue)}`
		);
		return false;
	}
};

export { createPool, closePool, basicDBQuery, parseJSONIntoDB };
