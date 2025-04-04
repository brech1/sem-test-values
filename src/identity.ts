import { Identity } from "@semaphore-protocol/core";
import { toBeArray, toUtf8Bytes } from "ethers";
import * as fs from "fs";

const identity = new Identity("privateKey");

const message = "message";

const signature = identity.signMessage(message);

const verified = Identity.verifySignature(
  message,
  signature,
  identity.publicKey
);

// Create data object with proper binary representation
const outputData = {
  message: {
    original: message,
    bytes: Array.from(toUtf8Bytes(message)),
  },
  signature: {
    R8: signature.R8.toString(),
    R8_x_bytes: Array.from(toBeArray(signature.R8[0])),
    R8_y_bytes: Array.from(toBeArray(signature.R8[1])),
    S: signature.S.toString(),
    S_bytes: Array.from(toBeArray(signature.S)),
  },
  identity: {
    privateKey: identity.privateKey,
    privateKey_bytes: Array.from(toUtf8Bytes(String(identity.privateKey))),
    publicKey: identity.publicKey.toString(),
    publicKey_x_bytes: Array.from(toBeArray(identity.publicKey[0])),
    publicKey_y_bytes: Array.from(toBeArray(identity.publicKey[1])),
    secretScalar: identity.secretScalar.toString(),
    secretScalar_bytes: Array.from(toBeArray(identity.secretScalar)),
    commitment: identity.commitment.toString(),
    commitment_bytes: Array.from(toBeArray(identity.commitment)),
  },
  verification: {
    result: verified,
  },
};

fs.writeFileSync("./identity-data.json", JSON.stringify(outputData, null, 2));
