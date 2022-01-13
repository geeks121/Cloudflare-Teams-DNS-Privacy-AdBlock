import { create } from "../../node_modules/@github/webauthn-json/dist/esm/webauthn-json.extended.js"

export function genSecureId(size = 1) {
	let array = new Uint32Array(size);
	window.crypto.getRandomValues(array);
	let secureIdString = '';
	array.forEach((e) => {
		secureIdString += e.toString(36);
	});
	return secureIdString;
}

export function generateKeys(callback) {
	let pubKeyChallenge = genSecureId(8);
	let userid = genSecureId(8);
	let pubkeyOpt = {
		// challenge: Uint8Array.from(pubKeyChallenge, c => c.charCodeAt(0)),
		challenge: pubKeyChallenge,
		rp: {
			name: "cftdpa",
			// id: "cftdpa.pages.dev"
		},
		user: {
			name: "Local User",
			displayName: "Local User",
			// id: Uint8Array.from(userid, c => c.charCodeAt(0)),
			id: userid,
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
		authenticatorSelection: {
			// userVerification: "required",
			authenticatorAttachment: "platform"
		},
		attestation: "indirect"
	};
	console.log("Key options", pubkeyOpt);
	create({
		publicKey: pubkeyOpt
	}).then((newCredentialInfo) => {
		console.log(newCredentialInfo);
		$(function () {
			$("body").append(`<div class="alert alert-info" role="alert">
				Key options<pre><code>${JSON.stringify(newCredentialInfo
, null, '\t')}</code></pre>
			</div>`);
		});
	}).catch((err) => {
		console.error(err);
		$(function () {
			$("body").append(`<div class="alert alert-danger" role="alert">
			<code>${err}</code>
		</div>`);
		});
	});
}

/*window.crypto.subtle.generateKey({
	name: "RSA-OAEP",
	modulusLength: "4096",
	publicExponent: new Uint8Array([1, 0, 1]),
	hash: "SHA-512"
}, false, ["encrypt", "decrypt"]).then((key) => {
	//returns a keypair object
	callback(key.privateKey, key.publicKey);
}).catch((err1) => {
	console.error(err1);
	window.crypto.subtle.generateKey({
		name: "RSA-OAEP",
		modulusLength: "4096",
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: "SHA-384"
	}, false, ["encrypt", "decrypt"]).then((key) => {
		//returns a keypair object
		callback(key.privateKey, key.publicKey);
	}).catch((err2) => {
		console.error(err2);
		window.crypto.subtle.generateKey({
			name: "RSA-OAEP",
			modulusLength: "4096",
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256"
		}, false, ["encrypt", "decrypt"]).then((key) => {
			//returns a keypair object
			callback(key.privateKey, key.publicKey);
		}).catch((err3) => {
			console.error(err3);
			callback(null, null);
		});
	});
});*/