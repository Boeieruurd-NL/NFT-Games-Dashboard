import { FC, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Grid, Text, Metric, Title, MultiSelect, MultiSelectItem } from '@tremor/react';
import NavbarSidebarLayout from '../../layouts/navbar-sidebar';
import { Token, Metadata, Collection, TraitFilters, RarityInfo } from './types'; 
import { fetchNFDsForAddresses } from './fetchNfd';
import './overlay.css'
import { HiSparkles } from 'react-icons/hi';


const CollectionDetailsPage: FC = function () {
  const { collectionId } = useParams();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [uniqueHoldersCount, setUniqueHoldersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [traitFilters, setTraitFilters] = useState<TraitFilters>({});
  const [selectedTraits, setSelectedTraits] = useState<TraitFilters>({});
const [rarityInfo, setRarityInfo] = useState<RarityInfo>({});
  
useEffect(() => {
  setIsLoading(true);
  fetch('https://nft-games.boeieruurd.com/api/collections')
      .then(response => response.json())
      .then(data => {
          const foundCollection = data.find((c: Collection) => c.contractId.toString() === collectionId);
          setCollection(foundCollection || null);
      })
      .catch(error => console.error('Error fetching collection details:', error));

  fetch(`https://arc72-idx.voirewards.com/nft-indexer/v1/tokens?contractId=${collectionId}`)
      .then(response => response.json())
      .then(async data => {
          setTokens(data.tokens);
          extractTraits(data.tokens);
          calculateUniqueHolders(data.tokens);
  
       
          const uniqueOwners: string[] = [...new Set(data.tokens.map(token => token.owner))] as string[];
          const ownerNFDs = await fetchNFDsForAddresses(uniqueOwners);
  
   
          const updatedTokens = data.tokens.map(token => ({
              ...token,
              ownerNFD: ownerNFDs[token.owner] ? ownerNFDs[token.owner] : formatCreatorAddress(token.owner),
          }));
  
          setTokens(updatedTokens);
        
          const assetIDs = data.tokens.map(token => parseInt(token.tokenId)); 
          fetchRarityInfo(collectionId, assetIDs);
      })
      .catch(error => console.error('Error fetching tokens:', error))
      .finally(() => setIsLoading(false));
}, [collectionId]);

const fetchRarityInfo = async (collectionId, assetIDs) => {
  try {
    const response = await fetch(`https://test-voi.api.highforge.io/assets/traitInfo/${collectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assetIDs }), 
    });
    const data = await response.json();
    setRarityInfo(data.assets); 
  } catch (error) {
    console.error('Error fetching rarity information:', error);
  }
};

    const calculateUniqueHolders = (tokens: Token[]) => {
      const uniqueHolders = new Set(tokens.map(token => token.owner));
      setUniqueHoldersCount(uniqueHolders.size); 
  };

    const formatCreatorAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const extractTraits = (tokens: Token[]) => {
            const traits: TraitFilters = {};
          tokens.forEach(token => {
        const metadata: Metadata = JSON.parse(token.metadata);
        Object.entries(metadata.properties).forEach(([key, value]) => {
                    if (!traits[key]) {
            traits[key] = [];
          }
          if (!traits[key]!.includes(value)) {
            traits[key]!.push(value);
          }
        });
      });
          setTraitFilters(traits);
          };
    
        const handleTraitSelection = (category: string, values: string[]) => {
      setSelectedTraits({ ...selectedTraits, [category]: values });
    };

    const filteredTokens = tokens.filter(token => {
      const metadata: Metadata = JSON.parse(token.metadata);
      return Object.entries(selectedTraits).every(([category, values]) => {
        if (values.length === 0) return true; 
        return values.includes(metadata.properties[category]!);
      });
    });

    const formatItemName = (name: string): string => {

      const nameWithoutHash = name.replace(/#/g, '');
  
      const match = nameWithoutHash.match(/(.*?)(\d+)$/);
      if (match && match[2] !== undefined) { 

        const [, prefix, number] = match;
        const formattedNumber = `#${number.padStart(2, '0')}`;
        return `${prefix} ${formattedNumber}`;
      }
    

      return nameWithoutHash;
    };

    const renderTraitFilters = () => {
        return (
          <Grid className='mt-4 mb-6 gap-4' numItemsLg={6} numItemsSm={2} numItemsMd={3}> 
            {Object.entries(traitFilters).map(([category, options]) => (
              <MultiSelect 
                key={category}
                placeholder={category}
                onValueChange={(values) => handleTraitSelection(category, values)}
              >
                {options.map(option => (
                  <MultiSelectItem key={option} value={option}>{option}</MultiSelectItem>
                ))}
              </MultiSelect>
            ))}
          </Grid>
        );
      };

      const renderTokenCard = (token: Token) => {
        const metadata: Metadata = JSON.parse(token.metadata);
        const formattedName = formatItemName(metadata.name);
        const tokenRarity = rarityInfo[token.tokenId]; 
    
        return (
            <Card key={token.tokenId} className="card-animation">
                <div
                    className="image-hover-grow cursor-pointer relative"
                    style={{
                        backgroundImage: `url(${metadata.image})`,
                        backgroundSize: 'cover',
                        height: '250px',
                        borderRadius: '15px'
                    }}
          
                    onClick={() => window.location.href = `https://nft-navigator.vercel.app/collection/${collectionId}/token/${token.tokenId}`}
                >
                    {tokenRarity && (
                     <div className="rankOverlay absolute bottom-0 right-0 bg-black p-2 text-white flex items-center">
                     <HiSparkles/> <span className="ml-2">{tokenRarity['HF--rank']}</span>
                      </div>
                    )}
                </div>
                <Title className='ml-1 mt-2 font-bold'>{formattedName}</Title>
                <Text className='ml-1 mt-2'>Owner: {token.ownerNFD}</Text>
            </Card>
        );
    };
    
    


      const renderCollectionInfo = () => {
        if (!collection) return null;
        return (
            <Card className="mb-6 text-center items-center">
                <Metric className='ml-1 mt-2 font-bold'>{collection.collectionName} Collection</Metric>
                <Text className='ml-1 mt-2'>Minted: {collection.minted} / {collection.maxSupply}</Text>
                <Text className='ml-1 mt-2'>Unique Holders: {uniqueHoldersCount}</Text> 
                <Text className='ml-1 mt-2'>Creator: {formatCreatorAddress(collection.creatorAddress)}</Text>
                <Text className='ml-1 mt-4'>{collection.description}</Text>
            </Card>
        );
    };

    const Spinner = () => (
      <div className="flex justify-center items-center">
        <div className="lds-ripple"><div></div><div></div></div>
      </div>
    );

    return (
      <NavbarSidebarLayout>
        <div className="mt-6 mx-6">
          {isLoading ? <Spinner /> : (
            <>
              {renderCollectionInfo()}
              {renderTraitFilters()}
              <Grid numItemsLg={4} className='gap-6'>
                {filteredTokens.map(renderTokenCard)}
              </Grid>
            </>
          )}
        </div>
      </NavbarSidebarLayout>
    );
  };

export default CollectionDetailsPage;
