import { Provider, Wallet, Idl, Program } from '@project-serum/anchor';
import { Keypair, Connection } from '@solana/web3.js';
import nIdl from './idl/namaph_multisig.json';
import mIdl from './idl/serum_multisig.json';
import { url } from './constants';

export const setup = (keypairJson: number[]) => {

	const keypair = Keypair.fromSecretKey(Buffer.from(keypairJson));
	const wallet = new Wallet(keypair);
	const commitment = 'processed';
	const connection = new Connection(url, commitment);
	const provider = new Provider(
		connection, 
		wallet, 
		{ preflightCommitment: commitment, commitment });

	const programs = {
		namaph: new Program(nIdl as Idl, nIdl.metadata.address, provider),
		multisig: new Program(mIdl as Idl, mIdl.metadata.address, provider)
	}

	return {
		user: keypair,
		programs
	}

}
