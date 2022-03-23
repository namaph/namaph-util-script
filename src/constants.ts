import { PublicKey } from '@solana/web3.js';
import nIdl from './idl/namaph_multisig.json';
import mIdl from './idl/serum_multisig.json';

// const url = 'https://api.devnet.solana.com';
export const url = 'http://127.0.0.1:8899';
export const mapName = 'debug';
export const namaphProgram: PublicKey = new PublicKey(nIdl.metadata.address);
export const multisigProgram: PublicKey = new PublicKey(mIdl.metadata.address);

