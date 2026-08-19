export interface NearSignedMessage {
  accountId: string;
  publicKey: string;
  signature: string;
}

export interface NearSignMessageWallet {
  signMessage?: (params: {
    message: string;
    recipient: string;
    nonce: Uint8Array;
    callbackUrl?: string;
  }) => Promise<NearSignedMessage | void>;
}
