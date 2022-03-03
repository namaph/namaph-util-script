import { PublicKey } from '@solana/web3.js';
import { Idl, Program } from '@project-serum/anchor';

export interface ITransactionAccount {
	pubkey: PublicKey,
	isWritable: boolean,
	isSigner: boolean
};

export interface IUpdateTopologyData {
	id: number,
	value: number,
};

export interface IPrograms {
	namaph: Program<Idl>,
	multisig: Program<Idl>
};

export interface IMultisigTransaction {
	proposer: PublicKey, // Membership
	multisig: PublicKey,
	programs: IPrograms
};


