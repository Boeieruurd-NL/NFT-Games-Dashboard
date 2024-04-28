import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Select, SelectItem } from '@tremor/react';

type AddressVolumeData = {
  address: string;
  weeklyVolumes: Record<string, number>;
};


export const AddressRankings = () => {
  const [addressData, setAddressData] = useState<Record<string, AddressVolumeData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const totalRewards = 2000000; 
  const rankPercentages = [
    16.45, 13.77, 11.51, 9.63, 8.05, 6.73, 5.63, 4.70,
    3.93, 3.29, 2.75, 2.30, 1.92, 1.61, 1.34, 1.12,
    0.94, 0.78, 0.66, 0.55, 0.46, 0.38, 0.32, 0.27,
    0.22, 0.19, 0.16, 0.13, 0.11, 0.10,
  ];

  useEffect(() => {
    const calculateWeeks = () => {
      const maxWeek = 9; 
      const minWeek = 5; 
      const startDate = new Date('2024-03-01T17:00:00Z');
      const now = new Date();
      const weeksPassed = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weeks = Math.min(weeksPassed, maxWeek);
      return Array.from({ length: weeks }, (_, i) => i + 1)
                   .filter(week => week >= minWeek)
                   .map(week => `Week ${week}`);
    };

    const weeks = calculateWeeks();
    setAvailableWeeks(weeks);
    setSelectedWeek(weeks[weeks.length - 1]);
    fetchAddressVolumes();
  }, []);

  const fetchAddressVolumes = async () => {
    setIsLoading(true);
    const startDate = new Date('2024-03-01T17:00:00Z').getTime();
  
    const collectionsResponse = await fetch(`https://test-voi.api.highforge.io/v2/nftGamesStats`);
    const collectionsData = await collectionsResponse.json();
    const collectionIds = collectionsData.map(collection => collection.applicationID);
  
    const salesResponse = await fetch(`https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales`);
    const salesData = await salesResponse.json();
  
    let tempAddressData = {};
    let tempUniqueTrades = {};
  
    salesData.sales.forEach(sale => {
      if (collectionIds.includes(sale.collectionId)) {
        const volume = sale.price / 1000000;
        const saleDate = new Date(sale.timestamp * 1000);
        const saleWeek = Math.floor((saleDate.getTime() - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const weekKey = `Week ${saleWeek}`;
        const tradeKey = `${sale.seller}-${sale.buyer}-${sale.tokenId}`;
  
        if (!tempUniqueTrades[weekKey]) {
          tempUniqueTrades[weekKey] = {};
        }
        if (!tempUniqueTrades[weekKey][sale.tokenId]) {
          tempUniqueTrades[weekKey][sale.tokenId] = new Set();
        }
  
        if (!tempUniqueTrades[weekKey][sale.tokenId].has(tradeKey)) {
          tempUniqueTrades[weekKey][sale.tokenId].add(tradeKey);
          [sale.buyer, sale.seller].forEach(participant => {
            if (!tempAddressData[participant]) {
              tempAddressData[participant] = { address: participant, weeklyVolumes: {} };
            }
  
            if (saleWeek === 9) {
              tempAddressData[participant].weeklyVolumes[`Week 9`] = 0;
            } else {
              tempAddressData[participant].weeklyVolumes[weekKey] = (tempAddressData[participant].weeklyVolumes[weekKey] || 0) + volume;
            }
          });
        }
      }
    });
  
    setAddressData(tempAddressData);
    setIsLoading(false);
  };
  
  

  const getVolumeForWeek = (addressVolumeData: AddressVolumeData, week: string) => {
    return addressVolumeData.weeklyVolumes[week] || 0;
  };
  const calculateReward = (rank: number, week: string) => {
    if (rank > 30) return 0; 
    const percentage = rankPercentages[rank - 1];
    let reward = Math.round((totalRewards * percentage) / 100); 
   
    if (week === "Week 8") {
       reward *= 2;
    }
   
    return reward;
   };
   

   const handleTies = (addresses, week) => {
    let currentRank = 1;
    let results = addresses.map((address, index) => ({
       ...address,
       rank: index + 1, 
       reward: calculateReward(index + 1, week) 
    }));
  
    let i = 0;
    while (i < results.length) {
      let tieCount = 1;
      let totalReward = calculateReward(currentRank, selectedWeek);
      let j = i + 1;
  
      while (j < results.length && getVolumeForWeek(results[j], selectedWeek) === getVolumeForWeek(results[i], selectedWeek)) {
        tieCount++;
        totalReward += calculateReward(currentRank + tieCount - 1, selectedWeek);
        j++;
      }
  
      let averageReward = totalReward / tieCount;
      for (let k = i; k < i + tieCount; k++) {
        results[k].reward = averageReward;
        results[k].rank = tieCount > 1 ? `${currentRank}-${currentRank + tieCount - 1}` : `${currentRank}`;
      }
  
      currentRank += tieCount;
      i += tieCount; 
    }
  
    return results;
  };
  
  const sortedAndHandledAddresses = handleTies(Object.values(addressData)
  .filter(data => getVolumeForWeek(data, selectedWeek) > 0)
  .sort((a, b) => getVolumeForWeek(b, selectedWeek) - getVolumeForWeek(a, selectedWeek)), selectedWeek);
 

  return (
    <div className="mx-auto">
      <div className="mb-4">
        <Select value={selectedWeek} onValueChange={setSelectedWeek} placeholder="Select Week">
          {availableWeeks.map(week => (
            <SelectItem key={week} value={week}>{week}</SelectItem>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="lds-ripple mt-24 mb-24 flex justify-center"><div></div><div></div></div>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Rank</TableHeaderCell>
              <TableHeaderCell>Address</TableHeaderCell>
              <TableHeaderCell>Volume</TableHeaderCell>
              <TableHeaderCell>Rewards</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
        {sortedAndHandledAddresses.map((data) => (
          <TableRow key={data.address}>
            <TableCell>{data.rank}</TableCell>
            <TableCell>{data.address}</TableCell>
            <TableCell>
              {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(getVolumeForWeek(data, selectedWeek))}
            </TableCell>
            <TableCell>
              {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(data.reward)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
        </Table>
      )}
    </div>
  );
};