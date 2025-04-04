import { Group } from "@semaphore-protocol/group";
import * as fs from "fs";

function convertBigInt(obj: any): any {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(convertBigInt);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigInt(v)])
    );
  }
  return obj;
}

const getGroupState = (group: Group) => ({
  root: group.root.toString(),
  depth: group.depth,
  size: group.size,
  members: group.members.map((m) => m.toString()),
});

const outputData: any = {};

// Empty Group
outputData.emptyGroup = {
  desc: "Empty group",
  state: getGroupState(new Group()),
};

// Initial Members
const initialMembers = [
  BigInt("1" + "0".repeat(29)),
  BigInt("2" + "0".repeat(29)),
  BigInt("3" + "0".repeat(29)),
];
const groupWithMembers = new Group(initialMembers);
outputData.initialMembers = {
  desc: "Group with initial members",
  members: initialMembers.map((x) => x.toString()),
  state: getGroupState(groupWithMembers),
};

// Add Members
const addGroup = new Group();
const newMembers = [
  BigInt("2" + "0".repeat(30)),
  BigInt("2" + "0".repeat(30) + "1"),
];
addGroup.addMembers(newMembers);
outputData.addMembers = {
  desc: "Adding multiple members",
  added: newMembers.map((x) => x.toString()),
  state: getGroupState(addGroup),
};

// Index Lookup
const indexGroup = new Group(initialMembers);
outputData.indexLookup = {
  desc: "Index lookup tests",
  state: getGroupState(indexGroup),
  existing: {
    member: initialMembers[1].toString(),
    index: indexGroup.indexOf(initialMembers[1]),
  },
  nonExisting: {
    member: "9".repeat(30),
    index: indexGroup.indexOf(BigInt("9".repeat(30))),
  },
};

// Merkle Proof
const proofGroup = new Group(initialMembers);
let proofError: string | null = null;
try {
  proofGroup.generateMerkleProof(999);
} catch (e: any) {
  proofError = e.toString();
}
outputData.merkleProof = {
  desc: "Merkle proof generation",
  valid: convertBigInt(proofGroup.generateMerkleProof(0)),
  invalidError: proofError,
};

// Update Member
const updateGroup = new Group(initialMembers);
const newValue = BigInt("3" + "0".repeat(30));
let updateError: string | null = null;
try {
  updateGroup.updateMember(999, BigInt(1));
} catch (e: any) {
  updateError = e.toString();
}
updateGroup.updateMember(1, newValue);
outputData.updateMember = {
  desc: "Member update",
  before: initialMembers.map((x) => x.toString()),
  index: 1,
  newValue: newValue.toString(),
  state: getGroupState(updateGroup),
  invalidError: updateError,
};

// Remove Member
const removeGroup = new Group(initialMembers);
let removeError: string | null = null;
try {
  removeGroup.removeMember(999);
} catch (e: any) {
  removeError = e.toString();
}
removeGroup.removeMember(0);
outputData.removeMember = {
  desc: "Member removal",
  removed: initialMembers[0].toString(),
  state: getGroupState(removeGroup),
  invalidError: removeError,
};

// Export/Import
const exportGroup = new Group(initialMembers);
const exported = exportGroup.export();
outputData.exportImport = {
  desc: "Export and import",
  exported,
  imported: getGroupState(Group.import(exported)),
};

// Sequential Operations
const seqGroup = new Group();
const seqMembers = initialMembers.slice(0, 3);
seqGroup.addMembers(seqMembers);
seqGroup.addMember(BigInt("4" + "0".repeat(29)));
seqGroup.updateMember(1, BigInt("5" + "0".repeat(29)));
seqGroup.removeMember(2);
outputData.sequentialOps = {
  desc: "Sequential operations",
  initial: seqMembers.map((x) => x.toString()),
  final: getGroupState(seqGroup),
};

fs.writeFileSync(
  "./group-data.json",
  JSON.stringify(convertBigInt(outputData), null, 2)
);
