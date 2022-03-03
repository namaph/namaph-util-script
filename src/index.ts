import keypairJson from './test_id.json';
import { setup } from './setup';
import { fetchMembership, fetchMultisig, fetchTopology, ITopology } from './fetch';
import { addMember, execute, init, updateTopology } from './rpc';
import { PublicKey, Keypair } from '@solana/web3.js';
import { web3 } from '@project-serum/anchor';

// basically we should hold the public key when we want to 
// point to an account (ex: 'topology')
//
// the data of the that account should be named as 'xxData' 

const main = async () => {

	const mapName = 'map';

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
		const initResult = await init('username', mapName, 10, multisigKeypair, user.publicKey, programs);
		topology = initResult.topology;
		membership = initResult.membership;
		multisig = multisigKeypair.publicKey;
	}

	const [signer] = await PublicKey.findProgramAddress(
		[multisig.toBytes()],
		programs.multisig.programId
	);

	const mTx = {
		proposer: membership,
		multisig,
		programs
	};

	const newUser = Keypair.generate();
	const username = 'newuser';

	// let { newMembership, transaction }  = await addMember(
	// 	newUser.publicKey, 
	// 	'newusername', 
	// 	signer, 
	// 	mTx
	// );

	const transaction = Keypair.generate();

	const multisigData = await programs.multisig.account.multisig.fetch(multisig);
	let [newMembership] = await PublicKey.findProgramAddress([Buffer.from('membership'), newUser.publicKey.toBytes()], programs.namaph.programId);

	let owners = multisigData.owners;

	owners.push(newMembership);

	const accounts = programs.multisig.instruction.setOwners.accounts({
		multisig,
		multisigSigner: signer
	});

	const data = programs.multisig.coder.instruction.encode('set_owners', {
		owners
	});

	await programs.namaph.rpc.
		addMembershipAndCreateTransaction(
			username,
			newUser.publicKey,
			programs.multisig.programId,
			accounts,
			data,
			{
				accounts: {
					proposer: mTx.proposer,
					wallet: programs.namaph.provider.wallet.publicKey,
					multisig,
					transaction: transaction.publicKey,
					multisigProgram: programs.multisig.programId,
					membership: newMembership,
					systemProgram: web3.SystemProgram.programId
				},
				signers: [transaction],
				instructions: [
					await programs.multisig.account.transaction.createInstruction(
						transaction,
						1000
					)
				]
			});


	console.log(newMembership, transaction);
}

main();
