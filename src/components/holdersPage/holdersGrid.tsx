import { useState, useEffect } from 'react';
import { RiArrowRightUpLine } from '@remixicon/react';
import { Card, MultiSelect, MultiSelectItem } from '@tremor/react';
import React from 'react';
import { fetchNFDsForAddresses } from '../../pages/CollectionPages/fetchNfd';
import '../OsUtilityPage/spinner.css'

interface Token {
  collectionTitle: string;
  tokenIds: string[];
  metadataURI: string;
}

interface Holder {
  address: string;
  tokens: Token[];
  nfd?: string; 
}

interface CollectionInfo {
  tokenIds: string[];
  metadataURI: string;
}

interface HoldersData {
  [address: string]: {
    collections: {
      [collectionTitle: string]: CollectionInfo;
    };
    address: string;
  };
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function HoldersGrid({ onHoldersCountChange }) {
    const [holders, setHolders] = useState<Holder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
    const [allCollections, setAllCollections] = useState<string[]>([]);
    const [allAddresses, setAllAddresses] = useState<string[]>([]);
  
    useEffect(() => {
      async function fetchCollections() {
        setIsLoading(true);
        const collectionsResponse = await fetch('https://test-voi.api.highforge.io/v2/nftGamesStats');
        const collections = await collectionsResponse.json();
  
        const holdersData: HoldersData = {};
  
        for (const collection of collections) {
          const tokensResponse = await fetch(`https://arc72-idx.voirewards.com/nft-indexer/v1/tokens?contractId=${collection.applicationID}`);
          const tokensData = await tokensResponse.json();
  
          for (const token of tokensData.tokens) {
            if (!holdersData[token.owner]) {
              holdersData[token.owner] = { collections: {}, address: token.owner };
            }
  
            if (!holdersData[token.owner].collections[collection.title]) {
              holdersData[token.owner].collections[collection.title] = {
                tokenIds: [token.tokenId],
                metadataURI: token.metadataURI,
              };
            } else {
              holdersData[token.owner].collections[collection.title].tokenIds.push(token.tokenId);
            }
          }
        }
  
        // Fetch NFDs
        const addresses = Object.keys(holdersData);
        const nfdMappings = await fetchNFDsForAddresses(addresses);
  
        const holdersList: Holder[] = Object.values(holdersData).map(holder => ({
          ...holder,
          nfd: nfdMappings[holder.address], 
          tokens: Object.entries(holder.collections).map(([collectionTitle, { tokenIds, metadataURI }]) => ({
            collectionTitle,
            tokenIds,
            metadataURI,
          })),
        })).sort((a, b) => a.tokens.length - b.tokens.length);
  
        
        setHolders(holdersList);
        onHoldersCountChange(holdersList.length); 
        setIsLoading(false);
      }
  
      fetchCollections();
    }, [onHoldersCountChange]);
  
    useEffect(() => {
      const collectionsSet = new Set<string>();
      const addressesSet = new Set<string>();
  
      holders.forEach(holder => {
        holder.tokens.forEach(token => {
          collectionsSet.add(token.collectionTitle);
        });
        addressesSet.add(holder.address);
        if (holder.nfd) addressesSet.add(holder.nfd);
      });
  
      setAllCollections(Array.from(collectionsSet));
      setAllAddresses(Array.from(addressesSet));
    }, [holders]);
  
    const filteredHolders = holders.filter(holder =>
      (selectedCollections.length === 0 || holder.tokens.some(token => selectedCollections.includes(token.collectionTitle))) &&
      (selectedAddresses.length === 0 || selectedAddresses.includes(holder.address) || (holder.nfd && selectedAddresses.includes(holder.nfd)))
    );
  
    if (isLoading) {
      return (
        <div className="mx-auto">
          <div className="flex justify-center items-center">
            <div className="lds-ripple mt-24 mb-24 flex justify-center"><div></div><div></div></div>
          </div>
        </div>
      );
    }
  
    return (
      <>
<div className="flex justify-between mb-4 space-x-4">
  <div className="flex-1">
    <MultiSelect value={selectedCollections} onValueChange={setSelectedCollections} placeholder="Filter Collections">
      {allCollections.map((collection, index) => (
        <MultiSelectItem key={index} value={collection}>
          {collection}
        </MultiSelectItem>
      ))}
    </MultiSelect>
  </div>

  <div className="flex-1">
    <MultiSelect value={selectedAddresses} onValueChange={setSelectedAddresses} placeholder="Filter Addresses">
      {allAddresses.map((address, index) => (
        <MultiSelectItem key={index} value={address}>
          {address}
        </MultiSelectItem>
      ))}
    </MultiSelect>
  </div>
</div>

  
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {filteredHolders.map((holder) => (
            <Card key={holder.address} className="group relative p-4">
              <div className="flex items-center space-x-4">
              <span
                className={classNames(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-tremor-full text-tremor-default font-medium',
                  'bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle'
                )}
                aria-hidden={true}
              >
                {holder.address.substring(0, 2)}
              </span>
              <div className="truncate">
                <p className="truncate text-tremor-default font-medium dark:text-dark-tremor-content">
                  {holder.nfd || `${holder.address.substring(0, 8)}...${holder.address.substring(holder.address.length - 5)}`}
                </p>
                <p className="mt-2 truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Tokens Owned: {holder.tokens.reduce((acc, token) => acc + token.tokenIds.length, 0)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-0 border-t border-tremor-border dark:border-dark-tremor-border">
              <div className="px-3 py-2 border-r border-tremor-border dark:border-dark-tremor-border">
                <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">Collection Name</p>
              </div>
              <div className="px-3 py-2 flex flex-wrap">
                <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">Token ID(s)</p>
              </div>

              {holder.tokens.map((token, index) => (
                <React.Fragment key={index}>
                  <div className="truncate px-3 py-2 border-r border-tremor-border dark:border-dark-tremor-border">
                    <p className="truncate text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      {token.collectionTitle}
                    </p>
                  </div>
                  <div className="px-3 py-2 flex flex-wrap">
                    {token.tokenIds.map((tokenId, tokenIdIndex) => (
                      <React.Fragment key={tokenIdIndex}>
                        <span className="text-tremor-default ml-1 font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                          {tokenId}{tokenIdIndex < token.tokenIds.length - 1 ? ' / ' : ''}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>

    <a
      href={`https://nft-navigator.vercel.app/portfolio/${holder.address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto absolute right-4 top-4 text-tremor-content-subtle group-hover:text-tremor-content dark:text-dark-tremor-content-subtle group-hover:dark:text-dark-tremor-content"
    >
      <RiArrowRightUpLine className="h-4 w-4" aria-hidden={true} />
    </a>
          </Card>
        ))}
      </div>
    </>
  );
}

export default HoldersGrid;
