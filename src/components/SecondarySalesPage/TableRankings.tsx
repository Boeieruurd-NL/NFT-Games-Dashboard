import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Select, SelectItem } from '@tremor/react';
import '../../components/OsUtilityPage/spinner.css';


type CollectionSaleData = {
    rank: number;
    weeklyRewards: any;
    title: string;
    applicationID: string;
    weeklySales: Record<string, number>; 
    totalPoints: number; 
  };
  

  const totalRewardsPot = 12500000;
  const weeklyRewardsPot = totalRewardsPot / 9;
  const rankPercentages = [
    16.45, 13.77, 11.51, 9.63, 8.05, 6.73, 5.63, 4.70,
    3.93, 3.29, 2.75, 2.30, 1.92, 1.61, 1.34, 1.12,
    0.94, 0.78, 0.66, 0.55, 0.46, 0.38, 0.32, 0.27,
    0.22, 0.19, 0.16, 0.13, 0.11, 0.10,
  ];
  
  const assignRewardsToCollections = (collections) => {
    const weeks = 9; // Total weeks
    for (let week = 1; week <= weeks; week++) {
      const weekKey = `Week ${week}`;
      const currentWeeklyRewardsPot = week === 2 || week === 8 ? weeklyRewardsPot * 2 : weeklyRewardsPot;

      const currentRankRewards = rankPercentages.map(percentage => (currentWeeklyRewardsPot * percentage) / 100);

      let filteredAndSortedCollections = collections
        .filter(collection => collection.weeklySales[weekKey] > 0)
        .sort((a, b) => b.weeklySales[weekKey] - a.weeklySales[weekKey]);
  
        let currentRank = 1;
        for (let i = 0; i < filteredAndSortedCollections.length; i++) {
          let tieCount = 1;
          let totalReward = currentRankRewards[currentRank - 1] || 0; 
          let j = i + 1;
        
          // Check for ties
          while (j < filteredAndSortedCollections.length && filteredAndSortedCollections[j].weeklySales[weekKey] === filteredAndSortedCollections[i].weeklySales[weekKey]) {
            tieCount++;
            totalReward += currentRankRewards[currentRank + tieCount - 2] || 0; 
            j++;
          }
        
          let averageReward = totalReward / tieCount; 
          for (let k = i; k < i + tieCount; k++) {
            filteredAndSortedCollections[k].weeklyRewards = filteredAndSortedCollections[k].weeklyRewards || {};
            filteredAndSortedCollections[k].weeklyRewards[weekKey] = averageReward;
       
            filteredAndSortedCollections[k].weeklyRewards[`${weekKey}_Rank`] = tieCount > 1 ? `${currentRank}-${currentRank + tieCount - 1}` : `${currentRank}`;
          }
        
          currentRank += tieCount; 
          i += tieCount - 1; 
        }
                
    }
  
    return collections;
};
  
  
export const TableRankings = () => {
  const [collections, setCollections] = useState<CollectionSaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  useEffect(() => {
    const calculateWeeks = () => {
      const startDate = new Date('2024-03-01T17:00:00Z');
      const now = new Date();
      const weeks = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
    };

    setAvailableWeeks(calculateWeeks());
    setSelectedWeek(calculateWeeks()[calculateWeeks().length - 1]);
    fetchCollections();
  }, []);


const fetchCollections = async () => {
  setIsLoading(true);
  const startDate = new Date('2024-03-01T17:00:00Z').getTime();
  let maxWeek = 0;

  console.log("Fetching collections started...");

  try {
    const collectionsResponse = await fetch('https://test-voi.api.highforge.io/v2/nftGamesStats');
    const collectionsData = await collectionsResponse.json();

    console.log(`Fetched ${collectionsData.length} collections`);

    let processedCollections = await Promise.all(collectionsData.map(async (collection) => {
      const salesResponse = await fetch(`https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales?collectionId=${collection.applicationID}`);
      const salesData = await salesResponse.json();

      console.log(`Fetched sales for collection ID ${collection.applicationID}: ${salesData.sales.length} sales found`);

      let weeklySales = {};
      let tradeHistoryWeekly = {};

      salesData.sales.forEach(sale => {
        if (sale.price < 50000000000) return;
      
        let saleWeek = Math.floor((new Date(sale.timestamp * 1000).getTime() - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
              const weekKey = `Week ${saleWeek}`;
      
        if (!weeklySales[weekKey]) weeklySales[weekKey] = 0;
        if (!tradeHistoryWeekly[weekKey]) tradeHistoryWeekly[weekKey] = {};
      
        if (sale.buyer === sale.seller) {
          return;
        }
      
        const addresses = [sale.buyer, sale.seller].sort();
        const saleIdentifier = `${addresses[0]}-${addresses[1]}`;
        
          if (!tradeHistoryWeekly[weekKey][sale.tokenId]) {
          tradeHistoryWeekly[weekKey][sale.tokenId] = { salesHistory: new Set(), uniqueSaleCount: 0 };
        }
      
        const tokenSalesInfo = tradeHistoryWeekly[weekKey][sale.tokenId];
      
        if (!tokenSalesInfo.salesHistory.has(saleIdentifier)) {
tokenSalesInfo.salesHistory.add(saleIdentifier);
              const saleValue = tokenSalesInfo.uniqueSaleCount < 10 ? 1 / Math.pow(2, tokenSalesInfo.uniqueSaleCount) : 0;
          weeklySales[weekKey] += saleValue;
            tokenSalesInfo.uniqueSaleCount++;
}
      
        if (saleWeek > maxWeek) maxWeek = saleWeek;
      });

if (weeklySales[`Week 9`]) {
  weeklySales[`Week 9`] = 0;
}

      if (weeklySales[`Week 1`] && weeklySales[`Week 2`]) {
        weeklySales[`Week 2`] += weeklySales[`Week 1`];
        weeklySales[`Week 1`] = 0;
      }
      

      
console.log(`Processed sales for collection ID ${collection.applicationID}. Week-wise sales:`, weeklySales);
      console.log(`Unique sales count per token per week for collection ID ${collection.applicationID}:`, tradeHistoryWeekly);

      return {
        title: collection.title,
        applicationID: collection.applicationID,
        weeklySales,
        weeklyRewards: {},
      };
    }));

    processedCollections = assignRewardsToCollections(processedCollections);
    processedCollections.forEach(collection => {
      const numericRewards = Object.values(collection.weeklyRewards).filter(value => typeof value === 'number') as number[];
      collection.totalPoints = numericRewards.reduce((acc, curr) => acc + curr, 0);
    });

    setCollections(processedCollections);
    setAvailableWeeks(Array.from({ length: maxWeek }, (_, i) => `Week ${i + 1}`));
    setSelectedWeek(`Week ${maxWeek}`);

    console.log(`All collections processed. Available weeks: ${maxWeek}. Selected week: Week ${maxWeek}`);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setIsLoading(false);
console.log("Fetching and processing collections completed.");
      }
};

  
  const sortedCollections = collections
  .filter(collection => collection.weeklySales[selectedWeek] > 0)
  .sort((a, b) => (b.weeklySales[selectedWeek] || 0) - (a.weeklySales[selectedWeek] || 0));

  return (
    <div className="mx-auto">
      <div className="mb-4">
        <Select value={selectedWeek} onValueChange={(value) => setSelectedWeek(value)} placeholder="Select Week">
          {availableWeeks.map((week) => (
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
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>App-Id</TableHeaderCell>
              <TableHeaderCell>Sales Score</TableHeaderCell>
              <TableHeaderCell>Points / Rewards</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {sortedCollections.map((collection, index) => (
  <TableRow key={index}>
    <TableCell>{collection.weeklyRewards[`${selectedWeek}_Rank`] || index + 1}</TableCell>
    <TableCell>{collection.title}</TableCell>
    <TableCell>{collection.applicationID}</TableCell>
    <TableCell>{collection.weeklySales[selectedWeek] || 0}</TableCell>
    <TableCell>
      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(collection.weeklyRewards[selectedWeek] || 0)}
    </TableCell>
  </TableRow>
))}

   </TableBody>
    
        </Table>
      )}
    </div>
  );
};