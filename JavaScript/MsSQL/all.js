//npm i mssql
import sql from "mssql";

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

		return false;
	} catch (err) {
		generalLogger.error(`createPool Func ${err}.`);
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

		generalLogger.error(`Database Pool Closed ERROR, Pool Name = ${name}`);
		return false;
	} catch (err) {
		generalLogger.error(`closePool Func ${err}.`);
		return false;
	}
};

const basicDBQuery = async (dbPoolInfo, dbQuery) => {
	try {
		const result = await dbPoolInfo.query(dbQuery);
		return result;
	} catch (err) {
		generalLogger.error(`basicDBQuery Func ${err}. Database Query = ${dbQuery}`);
		return false;
	}
};

const parseJSONIntoDB = async (databasePoolInfo, procedureName, queryValue) => {
	try {
		const databaseQuery = `EXEC ${procedureName} @genesysPayload = N'${JSON.stringify(queryValue)}'`;
		const result = await databasePoolInfo.query(databaseQuery);
		if (result.recordset[0].hasOwnProperty("Succeed")) return true;

		generalLogger.error(
			`Execute database procedure ${procedureName} ERROR Msg from database: ${result.recordset[0].ErrorMsg}.`
		);
		return false;
	} catch (err) {
		generalLogger.error(`Execute database procedure ${procedureName} ${err}. QueryValue = ${JSON.stringify(queryValue)}`);
		return false;
	}
};
