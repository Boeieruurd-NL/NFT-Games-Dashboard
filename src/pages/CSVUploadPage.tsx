// CSVUploadPage.tsx
import React, { useState } from 'react';
import { Grid, Card, Title, Button, Select, SelectItem, Text } from '@tremor/react';
import NavbarSidebarLayout from '../layouts/navbar-sidebar';
import CSVLogin from '../components/CSVLogin/CSVLogin';

const CSVUploadPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file as File | null);
  };

  const handleWeekChange = (value: string) => {
    setSelectedWeek(value);
  };

  const uploadFile = async () => {
    if (!selectedFile || !selectedWeek) {
      alert('Please select a file and a week first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`https://nft-games.boeieruurd.com/api/socials-upload-endpoint/${selectedWeek}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File successfully uploaded.');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      alert('Upload error. Please try again.');
    }
  };

  const uploadUtilityFile = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://nft-games.boeieruurd.com/api/utility-upload-endpoint', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File successfully uploaded.');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      alert('Upload error. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return <CSVLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <NavbarSidebarLayout>
      <div className="m-6">
        <Grid numItemsMd={2} numItemsLg={2} className="gap-6">
          <Card className=''>
            <div className="flex flex-col items-center justify-center p-4">
              <Title className="mb-6 text-sm font-medium text-gray-900 dark:text-gray-300">Upload Twitter Ranking CSV</Title>
              <div className="mb-4">
                <Select placeholder="Select week" value={selectedWeek} onValueChange={handleWeekChange}>
                  <SelectItem value="1">Week 1</SelectItem>
                  <SelectItem value="2">Week 2</SelectItem>
                  <SelectItem value="3">Week 3</SelectItem>
                  <SelectItem value="4">Week 4</SelectItem>
                  <SelectItem value="5">Week 5</SelectItem>
                  <SelectItem value="6">Week 6</SelectItem>
                  <SelectItem value="7">Week 7</SelectItem>
                  <SelectItem value="8">Week 8</SelectItem>
                  <SelectItem value="9">Week 9</SelectItem>
                </Select>
              </div>
              <input 
                id="file-upload" 
                type="file"
                accept=".csv" 
                onChange={handleFileChange}
                className="text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 
                          file:rounded-full file:border-0 
                          file:text-sm file:font-semibold 
                          file:bg-blue-50 file:text-blue-700 
                          hover:file:bg-blue-100"
              />
              <Button
                onClick={uploadFile}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={!selectedWeek}
              >
                Upload
              </Button>
            </div>
          </Card>
        <Card className=''>
          <div className="flex flex-col items-center justify-center p-4">
            <Title className="mb-6 text-sm font-medium text-gray-900 dark:text-gray-300">Upload Utility Ranking CSV</Title>
            <input 
              id="file-upload" 
              type="file"
              accept=".csv" 
              onChange={handleFileChange}
              className="text-sm text-gray-500 
                         file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-blue-50 file:text-blue-700 
                         hover:file:bg-blue-100"
            />
            <Button
              onClick={uploadUtilityFile}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Upload
            </Button>
          </div>
        </Card>
      </Grid>
      <Card className='mt-6'>
            <div className="flex flex-col items-center justify-center p-4">
             <Text>Both Utility and Socials CSV files NEED to contain the "Points / Rewards" and "App-Id" headers.</Text>
             <Text className='mt-2 mb-2'>Uploaded files INSTANTLY reflect on their respective pages, and the main leaderboard scores.</Text>
             <Text>If you made a mistake, re-upload the file to overwrite the old one.</Text>
              </div>
              </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default CSVUploadPage;
