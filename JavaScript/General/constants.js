import dotenv from "dotenv";
import ip from "ip";
import * as path from "path";

const defineEnv = () => {
	const localIPAddress = ip.address();
	switch (localIPAddress) {
		case "1.2.3.4":
		case "5.6.7.8":
			return "VM1";
		case "9.10.11.12":
			return "VM2";
		default:
			return "Local";
	}
};

const APP_RUNNING_ENV = defineEnv();

const PROJECT_FOLDERPATH = APP_RUNNING_ENV === "Local" ? "macPath" : "winPath";

const getEnvFileFields = () => {
	const envFilePath = `${PROJECT_FOLDERPATH}.env`;
	dotenv.config({ path: envFilePath });
	return process.env;
};

const LOG_FILEPATH = `${PROJECT_FOLDERPATH}logFiles${path.sep}`;
const SQL_USER = getEnvFileFields().SQL_USER;
