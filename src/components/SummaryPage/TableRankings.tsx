import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@tremor/react';
import { fetchAndCalculateTotalRewardsForCollections } from './getMarketPoints';
import Papa from 'papaparse';
import '../OsUtilityPage/spinner.css';

type Collection = {
  contractId: number;
  collectionName: string;
  marketPoints?: number; 
};

type SocialPoints = {
  [key: string]: number; 
};

type UtilityPoints = {
  [key: string]: number; 
};

export const TableRankings = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [socialPoints, setSocialPoints] = useState<SocialPoints>({});
  const [utilityPoints, setUtilityPoints] = useState<UtilityPoints>({});
  const [primaryPoints, setPrimaryPoints] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndProcessCSVs = async (weeks: string[]) => {
    const points: SocialPoints = {};

    for (const week of weeks) {
      const cacheBuster = new Date().getTime(); 
      const fileName = `socialranks-week-${week}.csv?cacheBust=${cacheBuster}`; 
      await fetch(`uploads/${fileName}`)
        .then(response => response.text())
        .then(csvData => {
          Papa.parse(csvData, {
            header: true,
            complete: (result) => {
              result.data.forEach((row: any) => {
                const appId = row['App-ID'];
                const rewards = parseInt(row['Points / Rewards'], 10);
                if (!isNaN(rewards)) {
                  points[appId] = points[appId] ? points[appId] + rewards : rewards;
                }
              });
            },
          });
        });
    }

    return points;
  };

  const fetchAndProcessUtilityCSV = async () => {
    const utilityPoints: UtilityPoints = {};
    const cacheBuster = new Date().getTime();
    const fileName = `utility-ranks.csv?cacheBust=${cacheBuster}`; 
    await fetch(`uploads/${fileName}`)
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            result.data.forEach((row: any) => {
              const appId = row['App-ID'];
              const utilityScore = parseInt(row['Points / Rewards'], 10);
              if (!isNaN(utilityScore)) {
                utilityPoints[appId] = utilityScore;
              }
            });
          },
        });
      });

    return utilityPoints;
  };

  useEffect(() => {
    setIsLoading(true);
  
    const fetchData = async () => {
      const marketPointsData = await fetchAndCalculateTotalRewardsForCollections();

  
      const weeks = await fetch('https://nft-games.boeieruurd.com/api/available-social-weeks')
        .then(response => response.json())
        .catch(error => {
          console.error('Error fetching social weeks:', error);
          return [];
        });
  
      const collectionsData = await fetch('https://test-voi.api.highforge.io/v2/nftGamesStats')
        .then(response => response.json())
        .then(data => data.map((item) => ({
          contractId: item.applicationID,
          collectionName: item.title,
          primaryPointsRank: item.rank,
                  })))
        .catch(error => {
          console.error('Error fetching collections data:', error);
          return [];
        });
  
      const socialPointsData = await fetchAndProcessCSVs(weeks);

      const utilityPointsData = await fetchAndProcessUtilityCSV();
  
      const rewardPercentages = [
        16.45, 13.77, 11.51, 9.63, 8.05,
        6.73, 5.63, 4.70, 3.93, 3.29,
        2.75, 2.30, 1.92, 1.61, 1.34,
        1.12, 0.94, 0.78, 0.66, 0.55,
        0.46, 0.38, 0.32, 0.27, 0.22,
        0.19, 0.16, 0.13, 0.11, 0.10
      ];
      const totalPrimaryPoints = 6250000; 
      

      const calculateRewards = (index, rewardPercentages, totalRewards) => {
        if (index < rewardPercentages.length) {
          const percentage = rewardPercentages[index] / 100;
          const reward = totalRewards * percentage;
          return reward;
        }
        return 0;
      };
      
      const calculateTieRewards = (data, rewardPercentages, totalRewards) => {
        let rewardDistribution = data.map((item, index) => ({
          ...item,
          pointsRewards: calculateRewards(index, rewardPercentages, totalRewards),
        }));
      

        const rankGroups = rewardDistribution.reduce((acc, curr) => {
          (acc[curr.primaryPointsRank] = acc[curr.primaryPointsRank] || []).push(curr);
          return acc;
        }, {});
      
        Object.keys(rankGroups).forEach(rank => {
          if (rankGroups[rank].length > 1) {
            const totalTieRewards = rankGroups[rank].reduce((sum, { pointsRewards }) => sum + pointsRewards, 0);
            const equalShare = totalTieRewards / rankGroups[rank].length;
            rankGroups[rank].forEach(item => item.pointsRewards = equalShare);
          }
        });
      
        return rewardDistribution;
      };
      
      const primaryPointsData = calculateTieRewards(collectionsData, rewardPercentages, totalPrimaryPoints);

      const updatedCollections = collectionsData.map(collection => {
        const marketPoints = marketPointsData.find(mp => mp.applicationID.toString() === collection.contractId.toString())?.totalPoints || 0;
        const socialPointsValue = socialPoints[collection.contractId.toString()] || 0;
        const utilityPointsValue = utilityPoints[collection.contractId.toString()] || 0;
        const contractIdStr = collection.contractId.toString();
        const primaryPointsValue = parseInt((primaryPoints[contractIdStr] || '').replace(/,/g, ''), 10) || 0;
  
        const totalPoints = primaryPointsValue + marketPoints + socialPointsValue + utilityPointsValue;
  
        return {
          ...collection,
          marketPoints, 
          totalPoints, 
        };
      })
  
     
      setCollections(updatedCollections);
     
const primaryPointsObject = primaryPointsData.reduce((acc, item) => {
  acc[item.contractId] = item.pointsRewards;
  return acc;
}, {});

setPrimaryPoints(primaryPointsObject);

      setUtilityPoints(utilityPointsData);
      setSocialPoints(socialPointsData);
      setIsLoading(false);
    };
  
    fetchData();
  }, []);
  
  return (
    <div className="mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="lds-ripple mt-24 mb-24 flex justify-center"><div></div><div></div></div>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>App-ID</TableCell>
              <TableCell>Primary Points</TableCell>
              <TableCell>Market Points</TableCell>
              <TableCell>Social Points</TableCell>
              <TableCell>Utility Points</TableCell>
              <TableCell>Total Points</TableCell>
              <TableCell>Bonus Rewards</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {collections
  .map(collection => {
    const { contractId, marketPoints } = collection;
    const socialPointsValue = socialPoints[contractId.toString()] || 0;
    const utilityPointsValue = utilityPoints[contractId.toString()] || 0;
    const primaryPointsValue = parseInt(primaryPoints[contractId.toString()]) || 0;
    const roundedMarketPoints = Math.round(marketPoints || 0);
    const totalPoints = primaryPointsValue + roundedMarketPoints + socialPointsValue + utilityPointsValue;
  
    return { ...collection, totalPoints };
  })
  .filter(collection => collection.totalPoints > 0)
  .sort((a, b) => b.totalPoints - a.totalPoints)
  .map((collection, index) => {
    const { collectionName, contractId } = collection;
    const primaryPointsValue = parseInt(primaryPoints[contractId.toString()]) || 0;
    const socialPointsValue = socialPoints[contractId.toString()] || 0;
    const utilityPointsValue = utilityPoints[contractId.toString()] || 0;
    const roundedMarketPoints = Math.round(collection.marketPoints || 0);
    const totalPoints = collection.totalPoints;
  
        // Calculate bonus rewards
        const rank = index + 1;
        const bonusPercentage = rank <= 30 ? {
          1: 16.45, 2: 13.77, 3: 11.51, 4: 9.63, 5: 8.05, 6: 6.73, 7: 5.63, 8: 4.70, 9: 3.93, 10: 3.29,
          11: 2.75, 12: 2.30, 13: 1.92, 14: 1.61, 15: 1.34, 16: 1.12, 17: 0.94, 18: 0.78, 19: 0.66, 20: 0.55,
          21: 0.46, 22: 0.38, 23: 0.32, 24: 0.27, 25: 0.22, 26: 0.19, 27: 0.16, 28: 0.13, 29: 0.11, 30: 0.10,
        }[rank] / 100 : 0;
        const totalBonusRewards = 67647187;
        const bonusReward = totalBonusRewards * bonusPercentage;
  
    return (
      <TableRow key={index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{collectionName}</TableCell>
        <TableCell>{contractId}</TableCell>
        <TableCell>{primaryPointsValue.toLocaleString()}</TableCell>
        <TableCell>{roundedMarketPoints.toLocaleString()}</TableCell>
        <TableCell>{socialPointsValue.toLocaleString()}</TableCell>
        <TableCell>{utilityPointsValue.toLocaleString()}</TableCell>
        <TableCell>{totalPoints.toLocaleString()}</TableCell>
        <TableCell>{bonusReward.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) || "0"}</TableCell>
      </TableRow>
    );
  })}
  
          </TableBody>
        </Table>
      )}
    </div>
  );
  
            }  