import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PhantomProvider } from "../types/solana";

export const getPhantom = (): PhantomProvider | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { solana?: PhantomProvider };
  return w.solana ?? null;
};

export const paySolToken = async (
  mint: string,
  units: bigint,
  treasuryOwner: string,
) => {
  const provider = getPhantom();
  if (!provider) {
    throw new Error("no Solana wallet detected (install Phantom)");
  }
  if (!treasuryOwner) {
    throw new Error("solana treasury isn't set up here");
  }
  const { publicKey } = await provider.connect();
  const owner = new PublicKey(publicKey.toString());
  const mintPk = new PublicKey(mint);
  const destOwner = new PublicKey(treasuryOwner);
  const source = getAssociatedTokenAddressSync(mintPk, owner);
  const destination = getAssociatedTokenAddressSync(mintPk, destOwner);
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  );
  const tx = new Transaction()
    .add(
      createAssociatedTokenAccountIdempotentInstruction(owner, destination, destOwner, mintPk),
    )
    .add(createTransferInstruction(source, destination, owner, units));
  tx.feePayer = owner;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const { signature } = await provider.signAndSendTransaction(tx);
  return signature;
};
