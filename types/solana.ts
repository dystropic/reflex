export interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  signAndSendTransaction: (transaction: unknown) => Promise<{ signature: string }>;
}
