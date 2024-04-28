import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Grid, Metric, Text, Button } from '@tremor/react';
import NavbarSidebarLayout from '../../layouts/navbar-sidebar';
import '../../components/OsUtilityPage/spinner.css' 
import { Collection } from './types';
import { FiCopy, FiExternalLink } from 'react-icons/fi';

const CollectionOverviewPage: FC = function () {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    setIsLoading(true);
    fetch('https://nft-games.boeieruurd.com/api/collections')
      .then(response => response.json())
      .then(async (data: Collection[]) => {
        // Extract addresses
        const addresses = data.map(collection => collection.creatorAddress);
  

        const nfdMappings = await fetchNFDsForAddresses(addresses);
 
        const updatedCollections = data.map(collection => ({
          ...collection,
          creatorNFD: nfdMappings[collection.creatorAddress] ? nfdMappings[collection.creatorAddress] : formatCreatorAddress(collection.creatorAddress),
        }));
  
        const filteredCollections = updatedCollections.filter(collection => collection.maxSupply === 50);
  
        const finalCollections = filteredCollections.filter(collection => collection.contractId !== 26178469);
  
        setCollections(finalCollections);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching collections:', error);
        setIsLoading(false);
      });
  }, []);
  
  
  


  const fetchNFDsForAddresses = async (addresses: string[]): Promise<{ [address: string]: string }> => {
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
  
  
  const formatCreatorAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

   // Function to handle redirection
   const redirectToCollectionPage = (contractId: number) => {
    navigate(`/collections/${contractId}`);
  };

  const Spinner = () => (
    <div className="flex justify-center items-center">
      <div className="lds-ripple mt-24 mb-24 flex justify-center"><div></div><div></div></div> 
    </div>
  );

  return (
    <NavbarSidebarLayout>
      <div className="mt-6 mx-6">
        {isLoading ? (
          <Spinner />
        ) : (
          <Grid numItemsLg={4} className='gap-6'>
           {collections.map((collection, index) => (
  <Card key={collection.contractId} className={`card-animation`} style={{animationDelay: `${index * 100}ms`}}>
    <div
      className="image-hover-grow cursor-pointer"
      style={{
        backgroundImage: `url(${collection.coverImageUrl})`,
        backgroundSize: 'cover',
        height: '250px',
        borderRadius: '15px'
      }}
      onClick={() => redirectToCollectionPage(collection.contractId)}
    />
    <Metric className='ml-1 mt-2 font-bold'>{collection.collectionName}</Metric>
    <div className='flex ml-1 mt-2 items-center'>
      <Text className='font-bold'>Contract ID:</Text>
      <Text className='ml-2'>{collection.contractId}</Text>
      <a 
        href={`https://voi.observer/explorer/application/${collection.contractId}/transactions`}
        target="_blank" 
        rel="noopener noreferrer"
        title="View transactions"
        className="ml-2 mb-1 flex items-center"
      >
        <FiExternalLink color="#a955f7" />
      </a>
    </div>
    <div className='flex ml-1 mt-2'>
      <Text className='font-bold'>Creator: </Text>
      <Text className='ml-2'>{collection.creatorNFD || formatCreatorAddress(collection.creatorAddress)}</Text>
      <FiCopy  color="#a955f7" className="ml-2 cursor-pointer" onClick={() => navigator.clipboard.writeText(collection.creatorAddress)} />
    </div>
    <Text className='ml-1 mt-2 font-bold'>Minted: {collection.minted} / {collection.maxSupply}</Text>
    <Button className='mt-4' onClick={() => redirectToCollectionPage(collection.contractId)}>See Details</Button>
  </Card>
))}

          </Grid>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default CollectionOverviewPage;

