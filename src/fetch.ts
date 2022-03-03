import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Idl, Program } from '@project-serum/anchor';
import BN from 'bn.js';
import { IPrograms } from './model';

export const fetchTransactions = async (program: Program<Idl>) => {
	const txs = await program.account.transaction.all();
}

export const fetchMultisig = async (programs: IPrograms) => {
	const multisigs = await programs.multisig.account.multisig.all();

	return multisigs;
}

export const fetchMembership = async (user: PublicKey, programs: IPrograms):
	Promise<{ publicKey: PublicKey, data: IMembership }> => {

	const [publicKey] = await PublicKey.findProgramAddress(
		[Buffer.from('membership'), user.toBytes()],
		programs.namaph.programId);

	const data = await programs.namaph.account.membership.fetch(publicKey) as IMembership;

	return { publicKey, data }
}

export interface IMembership {
	username: String,
	wallet: PublicKey,
	bump: number
}

export const fetchTopology = async (mapName: String, programs: IPrograms):
	Promise<{publicKey: PublicKey, data: ITopology}> => {

	const [publicKey] = await PublicKey.findProgramAddress(
		[Buffer.from('topology'), Buffer.from(mapName.slice(0, 32))],
		programs.namaph.programId);

	const data = await programs.namaph.account.topology.fetch(publicKey) as ITopology;

	return { publicKey, data }
}

export interface ITopology {
	authority: PublicKey,
	multisig: PublicKey,
	mapName: string,
	capacity: number,
	values: number[],
	bump: number
}



