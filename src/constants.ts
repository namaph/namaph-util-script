import { Idl } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import nIdl from './idl/namaph_multisig.json';
import mIdl from './idl/serum_multisig.json';

export const namaphProgram: PublicKey = new PublicKey(nIdl.metadata.address);
export const multisigProgram: PublicKey = new PublicKey(mIdl.metadata.address);

