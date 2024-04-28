import { ReactNode } from "react";

export interface AssetRarity {
  [traitName: string]: string | number; 
  'HF--rank': number;
  'HF--rarityScore': number; 
}

export interface RarityInfo {
  [tokenId: string]: AssetRarity;
}

export interface Token {
    ownerNFD: ReactNode;
    contractId: number;
    tokenId: number;
    owner: string;
    metadataURI: string;
    metadata: string;
    approved: string;
    mintRound: number;
  }
  
  export interface Metadata {
    name: string;
    description: string;
    image: string;
    properties: {
      [key: string]: string;
    };
  }
  
  export interface Collection {
    creatorNFD: string;
    contractId: number;
    minted: number;
    collectionName: string;
    unitName: string;
    maxSupply: number;
    creatorAddress: string;
    coverImageUrl: string;
    description: string;
    twitter: string;
    website: string;
  }
  
  // Trait Filters State Interface
  export interface TraitFilters {
    [key: string]: string[];
  }

  