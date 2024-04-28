import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Select, SelectItem } from '@tremor/react';
import Papa from 'papaparse';
import './spinner.css';

type CsvRow = Record<string, string>;

export const TableRankings = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const fetchAvailableWeeks = async () => {
    try {
      const response = await fetch('https://nft-games.boeieruurd.com/api/available-social-weeks');
      if (!response.ok) {
        throw new Error('Failed to fetch available weeks');
      }
      const weeks = await response.json();
      setAvailableWeeks(weeks);
      setSelectedWeek(weeks[weeks.length - 1]);
    } catch (error) {
      console.error('Error fetching available weeks:', error);
    }
  };


  const fetchCsvData = (week: string) => {
    setIsLoading(true);

    const cacheBuster = `?cacheBust=${new Date().getTime()}`;
    const csvFile = `uploads/socialranks-week-${week}.csv${cacheBuster}`;
    Papa.parse(csvFile, {
      download: true,
      header: true,
      complete: (result) => {
        if (Array.isArray(result.data) && result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          setHeaders(headers);
          setRows(result.data as CsvRow[]);
        }
        setIsLoading(false);
      },
    });
  };


  const handleWeekChange = (value: string) => {
    setSelectedWeek(value);
    fetchCsvData(value);
  };

  useEffect(() => {
    fetchAvailableWeeks();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      fetchCsvData(selectedWeek);
    }
  }, [selectedWeek]);


  const formatNumber = (numStr: string) => {
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
    return numStr; 
  };

  const renderCellContent = (header: string, content: string) => {
    if (header === 'Report' && content.startsWith('http')) {
      return <a href={content} target="_blank" rel="noopener noreferrer">Visit Tweetbinder</a>;
    } else if (header === 'Points / Rewards') {
      return formatNumber(content);
    } else {
      return content;
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-4">
        <Select value={selectedWeek} onValueChange={handleWeekChange} placeholder="Select Week">
          {availableWeeks.map((week) => (
            <SelectItem key={week} value={week}>{`Week ${week}`}</SelectItem>
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
              {headers.map((header, index) => (
                <TableHeaderCell key={index}>{header}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex}>
                    {renderCellContent(header, row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};