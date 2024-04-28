import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import '../OsUtilityPage/spinner.css';

export const TableRankings = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch('https://test-voi.api.highforge.io/v2/nftGamesStats');
      const jsonData = await response.json();

      const rewardPercentages = [
        16.45, 13.77, 11.51, 9.63, 8.05,
        6.73, 5.63, 4.70, 3.93, 3.29,
        2.75, 2.30, 1.92, 1.61, 1.34,
        1.12, 0.94, 0.78, 0.66, 0.55,
        0.46, 0.38, 0.32, 0.27, 0.22,
        0.19, 0.16, 0.13, 0.11, 0.10
      ];
      const totalRewards = 6250000; // Total rewards to distribute

      // Map data with basic information first
      const initialData = jsonData.map((item) => {
        const adjustedPublicLaunchDateTime = item.publicLaunchDateTime !== "2024-03-01T17:00:00.000Z" ? "2024-03-01T17:00:00.000Z" : item.publicLaunchDateTime;
      
        return {
          rank: item.rank,
          name: item.title,
          appId: item.applicationID,
          uniqueMinters: item.uniquePublicMinters,
          sales: item.nSold,
          timeToSellOut: calculateTimeToSellOut(adjustedPublicLaunchDateTime, item.tSellout),
          pointsRewards: 0,
        };
      });


      const processedData = calculateTieRewards(initialData, rewardPercentages, totalRewards);

      setData(processedData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const calculateTimeToSellOut = (publicLaunchDateTime, tSellout) => {
    if (tSellout === '') return '';
    const launchDate = new Date(publicLaunchDateTime).getTime();
    const soldOutDate = new Date(tSellout).getTime();
    const differenceInSeconds = (soldOutDate - launchDate) / 1000;
    return formatDuration(differenceInSeconds);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds.toFixed()}s`;
  };

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
      (acc[curr.rank] = acc[curr.rank] || []).push(curr);
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
              {['Rank', 'Name', 'App-ID', 'Unique Minters', 'Sale Score', 'Time to sell out', 'Points / Rewards'].map((header, index) => (
                <TableHeaderCell key={index}>{header}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{row.rank}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.appId}</TableCell>
                <TableCell>{row.uniqueMinters}</TableCell>
                <TableCell>{row.sales}</TableCell>
                <TableCell>{row.timeToSellOut}</TableCell>
                <TableCell>{row.pointsRewards.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
