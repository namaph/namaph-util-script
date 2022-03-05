import keypairJson from './test_id.json';
import { setup } from './setup';
import { fetchMembership, fetchMultisig, fetchTopology, ITopology } from './fetch';
import { addMember, changeThreshold, execute, init, createTreasury, updateTopology, spend, approve } from './rpc';
import { PublicKey, Keypair } from '@solana/web3.js';
import { BN, web3 } from '@project-serum/anchor';

// basically we should hold the public key when we want to 
// point to an account (ex: 'topology')
//
// the data of the that account should be named as 'xxData' 

const main = async () => {

	const mapName = 'namaph-test';

	const { user, programs } = setup(keypairJson);

	let topology: PublicKey;
	let membership: PublicKey;
	let multisig: PublicKey;

	try {
		let topologyAccount = await fetchTopology(mapName, programs);
		topology = topologyAccount.publicKey;
		multisig = topologyAccount.data.multisig;
		let membershipAccount = await fetchMembership(user.publicKey, programs);
		membership = membershipAccount.publicKey;
	} catch {
		console.log('we need to init!');
		const multisigKeypair = Keypair.generate();
		// we need to init.
		const initResult = await init('yasushisakai', mapName, 21, multisigKeypair, user.publicKey, programs);
		topology = initResult.topology;
		membership = initResult.membership;
		multisig = multisigKeypair.publicKey;
	}

	const [signer] = await PublicKey.findProgramAddress(
		[multisig.toBytes()],
		programs.multisig.programId
	);

	console.log(signer.toBase58());

	const mTx = {
		proposer: membership,
		multisig,
		programs
	};

	const newUser = Keypair.generate();
	const username = 'newuser';

	console.log('addmember');
	let { newMembership, transaction, accounts } = await addMember(
		newUser.publicKey,
		username,
		signer,
		mTx
	);

	await execute(
		accounts,
		multisig,
		signer,
		transaction.publicKey,
		programs.multisig.programId,
		programs.multisig
	);

	console.log('update topology');
	({ transaction, accounts } = await updateTopology(
		topology,
		{ id: 2, value: 1 },
		signer,
		mTx
	));

	await execute(
		accounts,
		multisig,
		signer,
		transaction.publicKey,
		programs.namaph.programId,
		programs.multisig
	);

	console.log('change threshold');
	({ transaction, accounts } = await changeThreshold(new BN(2), signer, mTx));

	await execute(
		accounts,
		multisig,
		signer,
		transaction.publicKey,
		programs.multisig.programId,
		programs.multisig
	);

	console.log('change threshold (again)');
	// the other owner proposes
	//const newMtx = {
	//	proposer: newMembership,
	//	multisig,
	//	programs
	//};

	({ transaction, accounts } = await changeThreshold(new BN(1), signer, mTx));

	await approve(programs, multisig, transaction.publicKey, newMembership, newUser.publicKey, [newUser])

	await execute(
		accounts,
		multisig,
		signer,
		transaction.publicKey,
		programs.multisig.programId,
		programs.multisig
	);

	const treasury = await createTreasury(
		'megei',
		multisig,
		signer,
		programs.namaph);

	// send some SOL
	let tx = new web3.Transaction().add(
		web3.SystemProgram.transfer({
			fromPubkey: programs.namaph.provider.wallet.publicKey,
			toPubkey: treasury,
			lamports: 1e9 * 10
		})
	);

	tx.feePayer = programs.namaph.provider.wallet.publicKey;

	await programs.namaph.provider.send(tx);

	console.log('spend');
	({ transaction, accounts } = await spend(treasury, programs.namaph.provider.wallet.publicKey, new BN(1e9 * 5), signer, mTx));

	await execute(
		accounts,
		multisig,
		signer,
		transaction.publicKey,
		programs.namaph.programId,
		programs.multisig
	);
}

main();
