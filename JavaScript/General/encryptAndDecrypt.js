import crypto from "crypto";

//Generate Secret Key
const secretKey = crypto.randomBytes(16).toString("hex");

//Encrypt
const encrypt = (text) => {
	const iv = crypto.randomBytes(16);
	// const cipher = crypto.createCipheriv(ALGORITHM, SECRETKEY, iv);
	const cipher = crypto.createCipheriv("aes-256-ctr", "3c60f7db66f5d661868460755a48b90e", iv);

	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return {
		iv: iv.toString("hex"),
		content: encrypted.toString("hex"),
	};
};

//Decrypt, AUTHENTICATION_KEY_IV And AUTHENTICATION_KEY_CONTENT are constants
const decrypt = () => {
	// const decipher = crypto.createDecipheriv(ALGORITHM, SECRETKEY, Buffer.from(AUTHENTICATION_KEY_IV, "hex"));
	const decipher = crypto.createDecipheriv(
		"aes-256-ctr",
		"3c60f7db66f5d661868460755a48b90e",
		Buffer.from(AUTHENTICATION_KEY_IV, "hex")
	);

	const decrpyted = Buffer.concat([decipher.update(Buffer.from(AUTHENTICATION_KEY_CONTENT, "hex")), decipher.final()]);

	return decrpyted.toString();
};
