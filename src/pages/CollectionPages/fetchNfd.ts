export const fetchNFDsForAddresses = async (addresses: string[]): Promise<{ [address: string]: string }> => {
    const chunkSize = 20;
    const addressChunks = Array(Math.ceil(addresses.length / chunkSize))
      .fill(null)
      .map((_, index) => index * chunkSize)
      .map(begin => addresses.slice(begin, begin + chunkSize));
  
    const fetchPromises = addressChunks.map(chunk => {
      const url = `https://api.nf.domains/nfd/lookup?${chunk.map(address => `address=${address}`).join('&')}&view=tiny&allowUnverified=true`;
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const mappings: { [address: string]: string } = {};
          for (const address in data) {
            mappings[address] = data[address].name || address; 
          }
          return mappings;
        })
        .catch(error => {
          console.error('Error fetching NFD for batch:', error);
          return {}; 
        });
    });
  
    const results = await Promise.all(fetchPromises);
    return results.reduce((acc, current) => ({ ...acc, ...current }), {});
  };