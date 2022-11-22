//npm i moment
import moment from "moment";

const varible = "2022-01-01";

//read a timestamp with particular known format
moment(varible, "YYYY-MM-DD");

//strict mode
moment(varible, "YYYY-MM-DD", true);

//hard copy a moment
moment(varible).clone();

//format the moment, add string "Z" as sample
moment(varible).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

//convert UTC to Local
moment.utc(varible).local();

//convert Local to UTC
moment(varible).utc();

//is timestamp valid
moment(varible).isValid();
