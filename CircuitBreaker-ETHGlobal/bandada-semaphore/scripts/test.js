const { Identity } = require("@semaphore-protocol/identity");
const supabase = require("../utils/supabaseClient");
const { getRoot } = require("../utils/useSemaphore");
const { getGroup, getMembersGroup } = require("../utils/bandadaApi");
const { Group } = require("@semaphore-protocol/group");
const {
  encodeBytes32String,
  toBigInt,
  decodeBytes32String,
  toBeHex,
} = require("ethers");
const { generateProof, verifyProof } = require("@semaphore-protocol/proof");

const groupId = "88868102350435587080743694571739";
const bandadaDashboardUrl = "https://bandada.pse.dev";
const appUrl = "https://credential-bandada-semaphore.vercel.app";

async function joinReviewerGroup() {
  const identity = new Identity("0xBa64434ADFB9C9344e1F27c6e644C7d38675116a");
  console.log("Identity:", identity.toString());

  const bandadaGroup = await getGroup(groupId);
  if (!bandadaGroup) {
    console.error("Group not found!");
    return;
  }
  console.log("bandadaGroup info is:", bandadaGroup);

  // const commitment = identity.commitment;
  const commitment = identity.getCommitment().toString();

  console.log("Commitment is:", commitment);

  const providerName = bandadaGroup.credentials.id.split("_")[0].toLowerCase();
  console.log("Provider Name is:", providerName);

  const credentialUrl = `${bandadaDashboardUrl}/credentials?group=${groupId}&member=${commitment}&provider=${providerName}&redirect_uri=${appUrl}/groups?redirect=true`;

  console.log(
    "Please visit the following URL2 to join the group:",
    credentialUrl
  );

  const groupRoot = await getRoot(
    groupId,
    bandadaGroup.treeDepth,
    bandadaGroup.members
  );
  console.log("Group Root is:", groupRoot.toString());

  await supabase
    .from("root_history(3)")
    .insert([{ root: groupRoot.toString() }]);

  const users = await getMembersGroup(groupId);
  console.log("group users is:", users);

  const group = new Group(groupId, 16, users);
  console.log(group);

  const feedback = "Hi, here is reviewer channel";
  const signal = toBigInt(encodeBytes32String(feedback)).toString();
  console.log("signal is:", signal);

  console.log("identity is:", identity);
  const { proof, merkleTreeRoot, nullifierHash } = await generateProof(
    identity,
    group,
    groupId,
    signal,
    {
      zkeyFilePath: "./semaphore.zkey",
      wasmFilePath: "./semaphore.wasm",
    }
  );
  console.log("merkleTreeRoot is:", merkleTreeRoot);

  console.log("supabase is:", supabase);

  const merkleTreeDepth = bandadaGroup.treeDepth;

  const { data: currentMerkleRoot, error: errorRootHistory } = await supabase
    .from("root_history(3)")
    .select()
    .order("created_at", { ascending: false })
    .limit(1);

  if (errorRootHistory) {
    console.log(errorRootHistory);
    res.status(500).end();
    return;
  }

  if (!currentMerkleRoot) {
    errorLog = "Wrong currentMerkleRoot";
    console.error(errorLog);
    return;
  }

  if (merkleTreeRoot !== currentMerkleRoot[0].root) {
    // compare merkle tree roots
    const { data: dataMerkleTreeRoot, error: errorMerkleTreeRoot } =
      await supabase
        .from("root_history(3)")
        .select()
        .eq("root", merkleTreeRoot);

    if (errorMerkleTreeRoot) {
      console.log(errorMerkleTreeRoot);
      res.status(500).end();
      return;
    }

    if (!dataMerkleTreeRoot) {
      errorLog = "Wrong dataMerkleTreeRoot";
      console.error(errorLog);
      return;
    }

    if (dataMerkleTreeRoot.length === 0) {
      errorLog = "Merkle Root is not part of the group";
      console.log(errorLog);
      return;
    }

    console.log("dataMerkleTreeRoot", dataMerkleTreeRoot);

    const merkleTreeRootDuration = group.fingerprintDuration;

    if (
      dataMerkleTreeRoot &&
      Date.now() >
        Date.parse(dataMerkleTreeRoot[0].created_at) + merkleTreeRootDuration
    ) {
      errorLog = "Merkle Tree Root is expired";
      console.log(errorLog);
      return;
    }
  }

  const { data: nullifier, error: errorNullifierHash } = await supabase
    .from("nullifier_hash(3)")
    .select("nullifier")
    .eq("nullifier", nullifierHash);

  if (errorNullifierHash) {
    console.log(errorNullifierHash);
    return;
  }

  if (!nullifier) {
    errorLog = "Wrong nullifier";
    console.log(errorLog);
    return;
  }

  if (nullifier.length > 0) {
    errorLog = "You are using the same nullifier twice";
    console.log(errorLog);
    return;
  }

  const isVerified = await verifyProof(
    {
      merkleTreeRoot,
      nullifierHash,
      externalNullifier: groupId,
      signal: signal,
      proof,
    },
    merkleTreeDepth
  );

  if (!isVerified) {
    const errorLog = "The proof was not verified successfully";
    console.error(errorLog);
    return;
  }

  const { error: errorNullifier } = await supabase
    .from("nullifier_hash(3)")
    .insert([{ nullifier: nullifierHash }]);

  if (errorNullifier) {
    console.error(errorNullifier);
    res.status(500).end();
    return;
  }

  const { data: dataFeedback, error: errorFeedback } = await supabase
    .from("feedback(3)")
    .insert([{ signal: signal }])
    .select()
    .order("created_at", { ascending: false });

  if (errorFeedback) {
    console.error(errorFeedback);
    return;
  }

  if (!dataFeedback) {
    const errorLog = "Wrong dataFeedback";
    console.error(errorLog);
    return;
  }

  const { data, error } = await supabase
    .from("feedback(3)")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  if (data) {
    console.log("Feedbacks:");
    data.forEach((feedbackItem) => {
      const decodedFeedback = decodeBytes32String(toBeHex(feedbackItem.signal));
      console.log(decodedFeedback);
    });
  }
}

joinReviewerGroup();
