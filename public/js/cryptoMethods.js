"use strict";

export class CryptTasks {
	constructor(localStorage) {
		this.localStorage = localStorage;
	}

	genSecureId(size = 1) {
		let array = new Uint32Array(size);
		window.crypto.getRandomValues(array);
		let secureIdString = '';
		array.forEach((e) => {
			secureIdString += e.toString(36);
		});
		return secureIdString;
	}

	algorithmNameForId(algId) {
		switch (Number(algId)) {
			case -36:
				return "ECDSA w/ SHA-512";
			case -35:
				return "ECDSA w/ SHA-384";
			case -47:
				return "ECDSA using secp256k1 curve and SHA-256";
			case -7:
				return "ECDSA w/ SHA-256";
			case -39:
				return "RSASSA-PSS w/ SHA-512";
			case -38:
				return "RSASSA-PSS w/ SHA-384";
			case -37:
				return "RSASSA-PSS w/ SHA-256";
			case -42:
				return "RSAES-OAEP w/ SHA-512";
			case -41:
				return "RSAES-OAEP w/ SHA-256";
			case -259:
				return "RSASSA-PKCS1-v1_5 using SHA-512";
			case -258:
				return "RSASSA-PKCS1-v1_5 using SHA-384";
			case -257:
				return "RSASSA-PKCS1-v1_5 using SHA-256";
			case -8:
				return "EdDSA";
			default:
				return `${Number(algId)} from https://www.iana.org/assignments/cose/cose.xhtml#algorithms`;
		}
	}

	loadKeys(successCallback, errorCallback) {
		navigator.credentials.get({
			publicKey: {
				challenge: Uint8Array.from(this.genSecureId(8), c => c.charCodeAt(0)),
				timeout: 60000,
				// allowCredentials: [{
				// 	// id: Uint8Array.from(this.localStorage.credentialId, c => c.charCodeAt(0)),
				// 	id: this.localStorage.credentialId,
				// 	type: 'public-key',
				// }],
			}
		}).then((assertion) => {
			console.log(assertion);
			const utf8Decoder = new TextDecoder('utf-8');
			const decodedClientData = utf8Decoder.decode(assertion.response.clientDataJSON);
			console.log(decodedClientData);
			// https://webauthn.guide/#authentication
			successCallback(assertion);
		}).catch((err) => {
			errorCallback(err);
		});
	}

	generateKeys(successCallback, errorCallback) {
		const pubKeyChallenge = this.genSecureId(8);
		const userid = this.genSecureId(8);
		// console.log("Key options", pubkeyOpt);
		navigator.credentials.create({
			publicKey: {
				challenge: Uint8Array.from(pubKeyChallenge, c => c.charCodeAt(0)),
				rp: {
					name: "cftdpa",
					// id: "cftdpa.pages.dev"
				},
				user: {
					name: "Local User",
					displayName: "Local User",
					id: Uint8Array.from(userid, c => c.charCodeAt(0)),
				},
				pubKeyCredParams: [
					// ECDSA w/ SHA-512
					{
						type: "public-key",
						alg: -36
					},
					// ECDSA w/ SHA-384
					{
						type: "public-key",
						alg: -35
					},
					// ECDSA using secp256k1 curve and SHA-256
					{
						type: "public-key",
						alg: -47
					},
					// ECDSA w/ SHA-256
					{
						type: "public-key",
						alg: -7
					},
					// RSASSA-PSS w/ SHA-512
					{
						type: "public-key",
						alg: -39
					},
					// RSASSA-PSS w/ SHA-384
					{
						type: "public-key",
						alg: -38
					},
					// RSASSA-PSS w/ SHA-256
					{
						type: "public-key",
						alg: -37
					},
					// RSAES-OAEP w/ SHA-512
					{
						type: "public-key",
						alg: -42
					},
					// RSAES-OAEP w/ SHA-256
					{
						type: "public-key",
						alg: -41
					},
					// RSASSA-PKCS1-v1_5 using SHA-512
					{
						type: "public-key",
						alg: -259
					},
					// RSASSA-PKCS1-v1_5 using SHA-384
					{
						type: "public-key",
						alg: -258
					},
					// RSASSA-PKCS1-v1_5 using SHA-256
					{
						type: "public-key",
						alg: -257
					},
					// EdDSA
					{
						type: "public-key",
						alg: -8
					}
				],
				// authenticatorSelection: {
				// 	userVerification: "required"
				// },
				attestation: "indirect"
			}
		}).then((credential) => {
			const utf8Decoder = new TextDecoder('utf-8');
			const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON);
			const clientDataObj = JSON.parse(decodedClientData);
			const decodedAttestationObj = CBOR.decode(credential.response.attestationObject);

			const { authData } = decodedAttestationObj;

			// get the length of the credential ID
			const dataView = new DataView(new ArrayBuffer(2));
			const idLenBytes = authData.slice(53, 55);
			idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
			const credentialIdLength = dataView.getUint16();

			// get the credential ID
			const credentialId = authData.slice(55, 55 + credentialIdLength);

			// get the public key object
			const publicKeyBytes = authData.slice(55 + credentialIdLength);

			// the publicKeyBytes are encoded again as CBOR
			const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
			successCallback(publicKeyObject["3"]);

			// store the publicKeyBytes and credentialId
			this.localStorage.savePublicKey(publicKeyBytes, credentialId);
		}).catch((err) => {
			errorCallback(err);
		});
	}

	getPasswordKey(password) {
