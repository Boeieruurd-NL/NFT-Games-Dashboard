import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import Papa from 'papaparse';
import './spinner.css';

type CsvRow = Record<string, string>;

export const TableRankings = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    setIsLoading(true); 

    const cacheBuster = `?cacheBust=${new Date().getTime()}`;

    Papa.parse(`uploads/utility-ranks.csv${cacheBuster}`, {
      download: true,
      header: true,
      complete: (result) => {
        if (Array.isArray(result.data) && result.data.length > 0 && typeof result.data[0] === 'object' && result.data[0] !== null) {
          const headers = Object.keys(result.data[0] as object);
          setHeaders(headers);
          setRows(result.data as CsvRow[]);
        }
        setTimeout(() => setIsLoading(false), 2000);
      }
    });
  }, []); 

  const formatNumber = (numStr: string) => {
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
    return numStr; 
  };

  const isRewardsOrPointsColumn = (header: string) => {
    return header.toLowerCase().includes('rewards') || header.toLowerCase().includes('points');
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
                    {isRewardsOrPointsColumn(header) ? formatNumber(row[header]) : row[header]}
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
