import { useState, useEffect, ChangeEvent } from 'react';
import { Card, Button, Grid, Text, Metric, Divider, TextInput, DialogPanel, Dialog, Title, SearchSelect, SearchSelectItem } from '@tremor/react';
import algosdk from 'algosdk';
import { arc72 } from 'ulujs';
import '../../components/OsUtilityPage/spinner.css';
import confetti from 'canvas-confetti';
import { WalletProvider, useInitializeProviders, PROVIDER_ID, useWallet } from '@txnlab/use-wallet';

import { algodClient, algodIndexer } from '../../utils/algod';

if (typeof window !== "undefined" && !window.global) {
  window.global = window;
}

const formatAddress = (address: string): string => address && address.length > 8 ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : address;

const SendNFT: React.FC = () => {
  const providers = useInitializeProviders({
    providers: [{ id: PROVIDER_ID.KIBISIS }],
    nodeConfig: {
      network: 'testnet',
      nodeServer: 'https://testnet-api.voi.nodly.io',
      nodeToken: '',
      nodePort: 443
    },
    algosdkStatic: algosdk
  });

  return (
    <WalletProvider value={providers}>
      <ConnectButton />
    </WalletProvider>
  );
};

const ConnectButton: React.FC = () => {
  const { providers, activeAccount, signTransactions, sendTransactions } = useWallet();
  const kibisisProvider = providers && providers[0];
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [nftId, setNftId] = useState<string>('');
  const [nfts, setNfts] = useState<{ contractId: number; tokenId: number; metadata: string; }[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [txIdState, setTxIdState] = useState<string>("");

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!activeAccount) return;
      setLoading(true);
      try {
        const response = await fetch(`https://arc72-idx.voirewards.com/nft-indexer/v1/tokens?owner=${activeAccount.address}`);
        const data = await response.json();
        setNfts(data.tokens);
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
        alert("Failed to fetch NFTs.");
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, [activeAccount]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleSendNFT = async () => {
    if (!activeAccount || !receiverAddress || !nftId) {
      alert("Please connect your wallet, enter the receiver's address and select an NFT.");
      return;
    }
    setLoading(true);
    try {
      const selectedNFT = nfts.find(nft => `${nft.contractId}-${nft.tokenId}` === nftId);
      if (!selectedNFT) {
        alert("Selected NFT not found.");
        setLoading(false);
        return;
      }
      const contractId = selectedNFT.contractId;
      const tokenid = BigInt(selectedNFT.tokenId);
      const ci = new arc72(contractId, algodClient, algodIndexer, {
          acc: { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
      });
      const arc72_transferFromR = await ci.arc72_transferFrom(activeAccount.address, receiverAddress, tokenid, true, false);

      if (!arc72_transferFromR.success) {
          alert("Failed to prepare NFT transfer. Please try again.");
          setLoading(false);
          return;
      }

      const signedTxns = await signTransactions(arc72_transferFromR.txns.map(txn => 
          Uint8Array.from(atob(txn), c => c.charCodeAt(0))
      ));

      if (!signedTxns || signedTxns.length === 0) {
          throw new Error("Signing transactions failed or no signed transactions were returned.");
      }

      const sendTxnResponse = await sendTransactions(signedTxns);
      const txId = sendTxnResponse.txId;

      setTxIdState(txId);
      confetti({ zIndex: 999, particleCount: 1000, spread: 250, origin: { y: 0.6 } });
      setDialogOpen(true);
    } catch (error) {
      console.error("NFT transfer failed:", error);
      alert(`Failed to send NFT. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

const handleSearchSelectChange = (value: string) => {
    setNftId(value); 
  };
  

  return (
    <>
      <Grid numItemsSm={1} numItemsLg={1} className="flex justify-center">
        <Card className="max-w-screen-md flex flex-col items-center">
          <Metric className='mb-4 text-center'>Send an NFT!</Metric>
          <Divider>Step 1: Connect your wallet.</Divider>
          <Button onClick={kibisisProvider?.isConnected ? kibisisProvider.disconnect : kibisisProvider?.connect} 
                  disabled={!kibisisProvider} 
                  className="my-2">
            {kibisisProvider && kibisisProvider.isConnected ? 'Disconnect Wallet' : 'Connect Kibisis Wallet'}
          </Button>
          {activeAccount && (
            <Text className="text-center mt-4">Connected Address: {formatAddress(activeAccount.address)}</Text>
          )}
          <Divider>Step 2: Enter Receiver's Address and Select an NFT</Divider>
          <TextInput placeholder="Receiver's Address" onChange={handleInputChange(setReceiverAddress)} />
          <SearchSelect
  placeholder="Select NFT"
  className='mt-4'
  onValueChange={handleSearchSelectChange} 
>
  {nfts.map(nft => {
    const metadata = JSON.parse(nft.metadata);
    const tokenName = metadata.name; 

    return (
      <SearchSelectItem
        key={`${nft.contractId}-${nft.tokenId}`}
        value={`${nft.contractId}-${nft.tokenId}`}
      >
        {tokenName} 
      </SearchSelectItem>
    );
  })}
</SearchSelect>
          <Button size='lg' className='mt-6' onClick={handleSendNFT} type='button' loading={loading} disabled={loading || nfts.length === 0}>
            Send NFT
          </Button>
        </Card>
      </Grid>
      {dialogOpen && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogPanel className='border-2 border-gray-300 ml-56 p-6'>
            <Title className="mb-3">NFT Sent Successfully!</Title>
            <Text>Happy NFT games!</Text>
            <Text className='mt-2'>Transaction ID: {txIdState}</Text>
            <Button variant="light" onClick={() => setDialogOpen(false)} className="mt-3">
              Got it!
            </Button>
          </DialogPanel>
        </Dialog>
      )}
    </>
  );
};

export default SendNFT;
