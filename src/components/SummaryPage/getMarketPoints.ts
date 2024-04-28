interface CollectionSaleData {
  rank: number;
  weeklyRewards: Record<string, number | string>; 
  title: string;
  applicationID: string;
  weeklySales: Record<string, number>;
  totalPoints: number;
}

const totalRewardsPot = 12500000;
const weeklyRewardsPot = totalRewardsPot / 9;

const rankPercentages = [
  16.45, 13.77, 11.51, 9.63, 8.05, 6.73, 5.63, 4.70,
  3.93, 3.29, 2.75, 2.30, 1.92, 1.61, 1.34, 1.12,
  0.94, 0.78, 0.66, 0.55, 0.46, 0.38, 0.32, 0.27,
  0.22, 0.19, 0.16, 0.13, 0.11, 0.10,
];

const generateSaleIdentifier = (buyer: string, seller: string, tokenId: number): string => {
  return `${buyer}-${seller}-${tokenId}`;
};

const fetchCollectionsData = async (): Promise<CollectionSaleData[]> => {
  const collectionsResponse = await fetch('https://test-voi.api.highforge.io/v2/nftGamesStats');
  const collectionsData: any[] = await collectionsResponse.json();
  return collectionsData.map(collection => ({
    rank: 0, 
    weeklyRewards: {},
    title: collection.title,
    applicationID: collection.applicationID,
    weeklySales: {},
    totalPoints: 0,
  }));
};

const fetchAndCalculateTotalRewardsForCollections = async (): Promise<CollectionSaleData[]> => {
  let collections = await fetchCollectionsData();
  const startDate = new Date('2024-03-01T17:00:00Z').getTime();
  
  for (const collection of collections) {
    const salesResponse = await fetch(`https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/sales?collectionId=${collection.applicationID}`);
    const salesData = await salesResponse.json();
    let weeklySales: Record<string, number> = {};
    let maxWeek = 0; 
    let tradeHistoryWeekly: Record<string, Record<string, { salesHistory: Set<string>; uniqueSaleCount: number }>> = {};

    salesData.sales.forEach(sale => {
      if (sale.price < 50000000000 || sale.buyer === sale.seller) return;

      let saleWeek = Math.floor((new Date(sale.timestamp * 1000).getTime() - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const weekKey = `Week ${saleWeek}`;
      
      if (!weeklySales[weekKey]) weeklySales[weekKey] = 0;
      if (!tradeHistoryWeekly[weekKey]) tradeHistoryWeekly[weekKey] = {};

      const saleIdentifier = generateSaleIdentifier(sale.buyer, sale.seller, sale.tokenId);

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

    if (weeklySales[`Week 1`] && weeklySales[`Week 2`]) {
      weeklySales[`Week 2`] += weeklySales[`Week 1`];
      weeklySales[`Week 1`] = 0; 
    }

     if (weeklySales[`Week 9`] && weeklySales[`Week 8`]) {
      weeklySales[`Week 9`] = 0; 
    }

    collection.weeklySales = weeklySales;
  }

  collections.forEach(collection => {
    console.log(`Collection: ${collection.title}`);
    Object.entries(collection.weeklySales).forEach(([week, sales]) => {
      console.log(`${week}: ${sales}`);
    });
  });


  return calculateTotalRewardsForCollections(collections);
};

const calculateTotalRewardsForCollections = (collections: CollectionSaleData[]): CollectionSaleData[] => {
  const weeks = 9;
  collections.forEach(collection => {
    collection.weeklyRewards = {};
  });

  for (let week = 1; week <= weeks; week++) {
    const weekKey = `Week ${week}`;
    const currentWeeklyRewardsPot = (week === 2 || week === 8) ? weeklyRewardsPot * 2 : weeklyRewardsPot;
    const currentRankRewards = rankPercentages.map(percentage => (currentWeeklyRewardsPot * percentage) / 100);
    let filteredAndSortedCollections = collections
      .filter(collection => collection.weeklySales[weekKey] > 0)
      .sort((a, b) => b.weeklySales[weekKey] - a.weeklySales[weekKey]);

    let currentRank = 1;
    for (let i = 0; i < filteredAndSortedCollections.length; i++) {
      let tieCount = 1;
      let totalReward = currentRankRewards[currentRank - 1] || 0;
      let j = i + 1;

      while (j < filteredAndSortedCollections.length && filteredAndSortedCollections[j].weeklySales[weekKey] === filteredAndSortedCollections[i].weeklySales[weekKey]) {
        tieCount++;
        totalReward += currentRankRewards[currentRank + tieCount - 2] || 0;
        j++;
      }

      let averageReward = totalReward / tieCount;
      for (let k = i; k < i + tieCount; k++) {
        filteredAndSortedCollections[k].weeklyRewards[weekKey] = averageReward;

        filteredAndSortedCollections[k].weeklyRewards[`${weekKey}_Rank`] = tieCount > 1 ? `${currentRank}-${currentRank + tieCount - 1}` : `${currentRank}`;
      }

      currentRank += tieCount;
      i += tieCount - 1;
    }
  }

  collections.forEach(collection => {
    const numericRewards = Object.values(collection.weeklyRewards).filter(value => typeof value === 'number') as number[];
    collection.totalPoints = numericRewards.reduce((acc, curr) => acc + curr, 0);
  });

  return collections;
};

export { fetchAndCalculateTotalRewardsForCollections };
