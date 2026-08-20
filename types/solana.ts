export interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  signAndSendTransaction: (transaction: unknown) => Promise<{ signature: string }>;
  signMessage: (
    message: Uint8Array,
    encoding: "utf8",
  ) => Promise<{ signature: Uint8Array }>;
}
