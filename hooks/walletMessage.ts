export const walletMessage = (address: string, nonce: string) =>
  `RCA reflex sign-in\naddress: ${address.toLowerCase()}\nnonce: ${nonce}`;
