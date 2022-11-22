//node v18+
import { setTimeout, setImmediate, setInterval } from "timers/promises";
await setTimeout(2000);

//old version
const forceProcessSleep = (ms) => {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
};
