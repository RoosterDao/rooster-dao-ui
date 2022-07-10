//

const ipfsGateway = 'https://cloudflare-ipfs.com/ipfs/';

export function fetchRooster(cid = 'QmeeCx81m6RVjmzbHjdeHABa7ksVPymwvXRWSuXSnvpoYG') {
  let description = '';
  return fetch(ipfsGateway + cid)
    .then(response => response.json())
    .then(metadata => {
      description = metadata.description;
      return fetch(ipfsGateway + metadata.mediaUri.replace('ipfs://ipfs/', ''));
    })
    .then(response => response.blob())
    .then(blob => ({
      imageUrl: URL.createObjectURL(blob),
      description,
    }));
}
