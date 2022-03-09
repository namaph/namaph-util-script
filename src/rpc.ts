import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Idl, Program, web3 } from '@project-serum/anchor';
import BN from 'bn.js';
import {
	IPrograms,
	ITransactionAccount,
	IUpdateTopologyData,
	IMultisigTransaction
} from './model';
import { namaphProgram, multisigProgram } from './constants';

export const init = async (
	username: string,
	mapName: string,
	capacity: number,
	multisigKeyPair: Keypair,
	payer: PublicKey,
	programs: IPrograms) => {

	const [signer, nonce] = await PublicKey.findProgramAddress(
		[multisigKeyPair.publicKey.toBytes()], multisigProgram);

	const [topology] = await PublicKey.findProgramAddress(
		[Buffer.from('topology'), Buffer.from(mapName.slice(0, 32))],
		namaphProgram);

	const [membership] = await PublicKey.findProgramAddress(
		[Buffer.from('membership'), multisigKeyPair.publicKey.toBytes(), payer.toBytes()],
		namaphProgram);

	await programs.namaph.rpc.initialize(username, mapName, capacity, nonce, {
		accounts: {
			topology,
			multisig: multisigKeyPair.publicKey,
			payer,
			membership,
			multisigProgram: multisigProgram,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		instructions: [
			await programs.multisig.account.multisig.createInstruction(
				multisigKeyPair,
				200)
		],
		signers: [multisigKeyPair]
	});

	return { topology, membership }
}

export const execute = async (
	accounts: ITransactionAccount[],
	multisig: PublicKey,
	signer: PublicKey,
	transaction: PublicKey,
	pid: PublicKey,
	multisigProgram: Program<Idl>) => {

	const remainingAccounts = accounts
		.map(a => a.pubkey.equals(signer) ? { ...a, isSigner: false } : a)
		.concat({
			pubkey: pid,
			isSigner: false,
			isWritable: false
		});

	await multisigProgram.rpc.executeTransaction({
		accounts: {
			multisig,
			multisigSigner: signer,
			transaction
		},
		remainingAccounts
	});
}

export const updateTopology = async (
	topology: PublicKey,
	updateTopology: IUpdateTopologyData,
	signer: PublicKey,
	mTx: IMultisigTransaction,
	userKp: Keypair | undefined = undefined,
) => {

	const transaction = Keypair.generate();
	let signers = [transaction];
	const { proposer, multisig, programs } = mTx;
	let user = programs.namaph.provider.wallet.publicKey;
	if (userKp) {
		user = userKp.publicKey;
		signers.push(userKp);
	}


	const data = mTx.programs.namaph.coder.instruction.encode(
		"update_topology", updateTopology
	);

	const accounts = mTx.programs.namaph.instruction.updateTopology.accounts({
		topology,
		proposer,
		authority: signer
	}) as ITransactionAccount[]

	const transactionSize = 1000;

	const [transactionMeta] = await PublicKey.findProgramAddress([
		Buffer.from('transaction_meta').slice(0,32), transaction.publicKey.toBytes(),
	],programs.namaph.programId);

	await mTx.programs.namaph.rpc.createTransaction(
		mTx.programs.namaph.programId, accounts, data, {
		accounts: {
			membership: proposer,
			multisig,
			wallet: user, // this needs to be tied to the membership
			transaction: transaction.publicKey,
			transactionMeta,
			multisigProgram,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		signers,
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				transactionSize
			)
		]
	});

	return { transaction, accounts }
}

export const addTextTopic = async (
	topicTitle: string,
	body: string,
	signer: PublicKey,
	mTx: IMultisigTransaction
) => {

	const { programs, multisig, proposer } = mTx;
	const [textTopic] = await PublicKey.findProgramAddress([
		Buffer.from("text"),
		multisig.toBytes(),
		Buffer.from(topicTitle.slice(0, 32))
	], programs.namaph.programId);

	const transaction = Keypair.generate();

	const data = programs.namaph.coder.instruction.encode("update_text_topic", {
		proposer,
		title: topicTitle,
		body
	})

	const accounts = programs.namaph.instruction.updateTextTopic.accounts({
		textTopic,
		authority: signer,
	}) as ITransactionAccount[];


	await programs.namaph.rpc.createTextTopic(
		topicTitle,
		signer,
		programs.namaph.programId,
		accounts,
		data,
		{
			accounts: {
				topic: textTopic,
				multisig,
				systemProgram: web3.SystemProgram.programId,
				proposer,
				wallet: programs.namaph.provider.wallet.publicKey,
				transaction: transaction.publicKey,
				multisigProgram,
			},
			signers: [transaction],
			instructions: [
				await programs.multisig.account.transaction.createInstruction(transaction, 2000)
			]
		});

	return {textTopic, transaction, accounts}
}

export const addUrlTopic = async (
	topicTitle: string,
	url: string,
	signer: PublicKey,
	mTx: IMultisigTransaction
) => {

	const { proposer, multisig, programs } = mTx;

	const [urlTopic] = await PublicKey.findProgramAddress([
		Buffer.from("url"),
		multisig.toBytes(),
		Buffer.from(topicTitle.slice(0, 32))
	], programs.namaph.programId);

	const transaction = Keypair.generate();

	const data = programs.namaph.coder.instruction.encode("update_url_topic", {
		title: topicTitle,
		url
	})

	const accounts = programs.namaph.instruction.updateUrlTopic.accounts({
		proposer,
		urlTopic,
		authority: signer,
	}) as ITransactionAccount[];


	await programs.namaph.rpc.createUrlTopic(
		topicTitle,
		signer,
		programs.namaph.programId,
		accounts,
		data,
		{
			accounts: {
				urlTopic,
				multisig,
				systemProgram: web3.SystemProgram.programId,
				proposer,
				wallet: programs.namaph.provider.wallet.publicKey,
				transaction: transaction.publicKey,
				multisigProgram,
			},
			signers: [transaction],
			instructions: [
				await programs.multisig.account.transaction.createInstruction(transaction, 2000)
			]
		});

	return {urlTopic, transaction, accounts}
}


export const addMember = async (
	newUser: PublicKey,
	username: String,
	// this pays, the new membership account's rent,
	// this pulic key needs to be different from the new 'user'
	// since the new user cannot be the proposer
	signer: PublicKey,
	mTx: IMultisigTransaction
) => {

	const { programs, multisig, proposer } = mTx;
	const transaction = Keypair.generate();
	const multisigData = await programs.multisig.account.multisig.fetch(multisig);
	let [newMembership] = await PublicKey.findProgramAddress(
		[Buffer.from('membership'), multisig.toBytes(), newUser.toBytes()],
		programs.namaph.programId);

	let owners = multisigData.owners;
	owners.push(newMembership);

	const accounts = programs.multisig.instruction.setOwners.accounts({
		multisig,
		multisigSigner: signer
	}) as ITransactionAccount[];

	const data = programs.multisig.coder.instruction.encode('set_owners', { owners });

	await programs.namaph.rpc.
		addMembershipAndCreateTransaction(
			username,
			newUser,
			multisigProgram,
			accounts,
			data,
			{
				accounts: {
					proposer: proposer,
					wallet: programs.namaph.provider.wallet.publicKey,
					multisig,
					transaction: transaction.publicKey,
					multisigProgram,
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


	return { newMembership, accounts, transaction }
}

export const approve = async (
	programs: IPrograms,
	multisig: PublicKey,
	transaction: PublicKey,
	membership: PublicKey,
	wallet = programs.namaph.provider.wallet.publicKey,
	signers = []
) => {

	await programs.namaph.rpc.approve({
		accounts: {
			multisig,
			transaction,
			wallet,
			membership,
			multisigProgram,
		},
		signers
	});
}

export const removeMember = async (
	remover: PublicKey,
	user: PublicKey,
	signer: PublicKey,
	mTx: IMultisigTransaction
) => {

	const { proposer, multisig, programs } = mTx;
	const multisigData = await programs.multisig.account.multisig.fetch(multisig);
	const owners = multisigData.owners;

	const pastOwners = owners.filter(
		m => m.toBase58() !== remover.toBase58()
	);

	if (owners.length !== pastOwners.length) {
		// throw ('no membership publickey to remove');
		console.error('no membership publickey to remove');
		return
	}

	const transaction = Keypair.generate();

	const data = programs.multisig.coder.instruction.encode("set_owners", {
		owners: pastOwners
	});

	let accounts = programs.multisig.instruction.setOwners.accounts({
		multisig,
		multisigSigner: signer
	}) as ITransactionAccount[];

	await programs.namaph.rpc.deleteMembershipAndCreateTransaction(
		programs.multisig.programId, accounts, data, {
		accounts: {
			proposer,
			// this should be the wallet 
			wallet: programs.namaph.provider.wallet.publicKey,
			multisig,
			transaction: transaction.publicKey,
			multisigProgram,
			membership: remover,
			user,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		signers: [transaction], // wallet is a signer
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				1000
			)
		]
	});

	return { transaction, accounts }
};

export const createTreasury = async (
	name: string,
	multisig: PublicKey,
	signer: PublicKey,
	namaphProgram: Program<Idl>) => {

	const [treasury] = await PublicKey.findProgramAddress(
		[Buffer.from('treasury'), multisig.toBytes(), Buffer.from(name)],
		namaphProgram.programId);

	await namaphProgram.rpc.createTreasury(name, signer, {
		accounts: {
			treasury,
			payer: namaphProgram.provider.wallet.publicKey,
			multisig,
			systemProgram: anchor.web3.SystemProgram.programId
		},
	});

	return treasury
};

export const spend = async (
	treasury: PublicKey,
	to: PublicKey,
	amount: BN,
	signer: PublicKey,
	mTx: IMultisigTransaction,
	userPk: Keypair | undefined = undefined,
) => {

	const transaction = Keypair.generate();
	const { proposer, multisig, programs } = mTx;

	const signers = [transaction];
	let user = programs.namaph.provider.wallet.publicKey;
	if (userPk) {
		user = userPk.publicKey;
		signers.push(userPk);
	}

	const data = programs.namaph.coder.instruction.encode("spend", {
		amount
	});

	console.log('multisig', mTx.multisig.toBase58());
	console.log('pid', mTx.programs.multisig.programId.toBase58());
	console.log('signer', signer.toBase58());

	const accounts = programs.namaph.instruction.spend.accounts({
		treasury,
		authority: signer,
		to
	}) as ITransactionAccount[];

	const [transactionMeta] = await PublicKey.findProgramAddress([
		Buffer.from('transaction_meta').slice(0,32), transaction.publicKey.toBytes(),
	],programs.namaph.programId);

	await programs.namaph.rpc.createTransaction(programs.namaph.programId, accounts, data, {
		accounts: {
			membership: proposer,
			multisig,
			wallet: user, // this needs to be tied to the membership (proposer)
			transaction: transaction.publicKey,
			transactionMeta,
			multisigProgram,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		signers,
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				1000
			)
		]
	});

	return { transaction, accounts }
}

export const changeThreshold = async (
	threshold: BN,
	signer: PublicKey,
	mTx: IMultisigTransaction,
	userKp: Keypair | undefined = undefined,
) => {

	const transaction = Keypair.generate();

	let { proposer, multisig, programs } = mTx;
	let signers = [transaction];
	let user = programs.namaph.provider.wallet.publicKey;
	if (userKp) {
		user = userKp.publicKey;
		signers.push(userKp);
	}

	const data = programs.multisig.coder.instruction.encode(
		"change_threshold", {
		threshold
	});

	const accounts = programs.multisig.instruction.changeThreshold.accounts({
		multisig,
		multisigSigner: signer
	}) as ITransactionAccount[];

	const [transactionMeta] = await PublicKey.findProgramAddress([
		Buffer.from('transaction_meta').slice(0,32), transaction.publicKey.toBytes(),
	],programs.namaph.programId);


	await programs.namaph.rpc.createTransaction(
		programs.multisig.programId, accounts, data, {
		accounts: {
			membership: proposer,
			multisig,
			wallet: user,
			transaction: transaction.publicKey,
			transactionMeta,
			multisigProgram,
			systemProgram: anchor.web3.SystemProgram.programId,
		}, signers,
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				1000
			)
		]
	});
	return { transaction, accounts }
}
