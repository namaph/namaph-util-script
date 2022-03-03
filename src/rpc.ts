import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Idl, Program } from '@project-serum/anchor';
import BN from 'bn.js';
import {
	IPrograms,
	ITransactionAccount,
	IUpdateTopologyData,
	IMultisigTransaction
} from './model';

export const init = async (
	username: string,
	mapName: string,
	capacity: number,
	multisigKeyPair: Keypair,
	payer: PublicKey,
	programs: IPrograms) => {

	const [signer, nonce] = await PublicKey.findProgramAddress(
		[multisigKeyPair.publicKey.toBytes()],
		programs.multisig.programId);

	const [topology] = await PublicKey.findProgramAddress(
		[Buffer.from('topology'), Buffer.from(mapName.slice(0, 32))],
		programs.namaph.programId);

	const [membership] = await PublicKey.findProgramAddress(
		[Buffer.from('membership'), payer.toBytes()],
		programs.namaph.programId);

	await programs.namaph.rpc.initialize(username, mapName, capacity, nonce, {
		accounts: {
			topology,
			multisig: multisigKeyPair.publicKey,
			payer,
			membership,
			multisigProgram: programs.multisig.programId,
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
) => {

	const { proposer, multisig, programs } = mTx;

	const transaction = Keypair.generate();

	const data = mTx.programs.namaph.coder.instruction.encode(
		"update_topology", updateTopology
	);

	const accounts = mTx.programs.namaph.instruction.updateTopology.accounts({
		topology,
		authority: signer
	}) as ITransactionAccount[]

	const transactionSize = 1000;

	await mTx.programs.namaph.rpc.createTransaction(
		mTx.programs.namaph.programId, accounts, data, {
		accounts: {
			membership: proposer,
			multisig: multisig,
			transaction: transaction.publicKey,
			multisigProgram: programs.multisig.programId,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		signers: [transaction],
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				transactionSize
			)
		]
	});

	return { transaction, accounts }
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

	const { programs } = mTx;
	const transaction = Keypair.generate();

	const multisigData = await programs.multisig.account.multisig.fetch(mTx.multisig);
	let [newMembership] = await PublicKey.findProgramAddress([Buffer.from('membership'), newUser.toBytes()], programs.namaph.programId);

	let owners = multisigData.owners;

	owners.push(newMembership);


	const accounts = programs.multisig.instruction.setOwners.accounts({
		multisig: mTx.multisig,
		multisigSigner: signer
	});

	const data = programs.multisig.coder.instruction.encode('set_owners', {
		owners
	});

	await programs.namaph.rpc.
		addMembershipAndCreateTransaction(
			username,
			newUser,
			programs.multisig.programId,
			accounts,
			data, {
			accounts: {
				proposer: mTx.proposer,
				wallet: programs.namaph.provider.wallet.publicKey,
				multisig: mTx.multisig,
				transaction: transaction.publicKey,
				multisigProgram: programs.multisig.programId,
				membership: newMembership,
				systemProgram: anchor.web3.SystemProgram.programId
			},
			signers: [transaction],
			instructions: [
				await programs.multisig.account.transaction.createInstruction(
					transaction,
					1000
				)
			]
		});

	return { newMembership, transaction }
}

export const removeMember = async (
	remover: PublicKey,
	user: PublicKey, // the 'wallet' user for remover
	wallet: PublicKey,
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
		throw ('no membership publickey to remove');
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
			// 
			wallet,
			multisig,
			transaction: transaction.publicKey,
			multisigProgram: programs.multisig.programId,
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

	return { transaction }
};

export const createTreasury = async (
	name: string,
	multisig: PublicKey,
	payer: PublicKey,
	signer: PublicKey,
	namaphProgram: Program<Idl>) => {

	const [treasury] = await PublicKey.findProgramAddress(
		[Buffer.from('treasury'), multisig.toBytes(), Buffer.from(name)],
		namaphProgram.programId);

	await namaphProgram.rpc.createTreasury(name, signer, {
		accounts: {
			treasury,
			payer,
			multisig,
			systemProgram: anchor.web3.SystemProgram.programId
		},
	});

	return { treasury }
};

export const spendTx = async (
	treasury: PublicKey,
	to: PublicKey,
	amount: BN,
	signer: PublicKey,
	mTx: IMultisigTransaction
) => {

	const { proposer, multisig, programs } = mTx;

	const transaction = Keypair.generate();

	const data = programs.namaph.coder.instruction.encode("spend", {
		amount
	});

	const accounts = programs.namaph.instruction.spend.accounts({
		treasury,
		authority: signer,
		to
	}) as ITransactionAccount[];

	await programs.namaph.rpc.createTransaction(programs.namaph, accounts, data, {
		accounts: {
			membership: proposer,
			multisig,
			transaction: transaction.publicKey,
			multisigProgram: programs.multisig.programId,
			systemProgram: anchor.web3.SystemProgram.programId
		},
		signers: [transaction],
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
) => {

	const { proposer, multisig, programs } = mTx;

	const transaction = Keypair.generate();

	const data = programs.multisig.coder.instruction.encode(
		"change_threshold", {
		threshold
	});

	const accounts = programs.multisig.instruction.changeThreshold.accounts({
		multisig,
		multisigSigner: signer
	}) as ITransactionAccount[];

	await programs.namaph.rpc.createTransaction(
		programs.multisig.programId, accounts, data, {
		accounts: {
			membership: proposer,
			multisig,
			transaction: transaction.publicKey,
			multisigProgram: programs.multisig.programId,
			systemProgram: anchor.web3.SystemProgram.programId,
		},
		signers: [transaction],
		instructions: [
			await programs.multisig.account.transaction.createInstruction(
				transaction,
				1000
			)
		]
	});
	return { transaction, accounts }
}
