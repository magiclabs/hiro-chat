export function shortenAddress(
  address: string,
  startLength = 6,
  endLength = 6,
) {
  if (!address || address.length !== 42) {
    throw new Error("Invalid Ethereum address");
  }

  const start = address.slice(0, startLength + 2); // Include '0x'
  const end = address.slice(-endLength);

  return `${start}...${end}`;
}
