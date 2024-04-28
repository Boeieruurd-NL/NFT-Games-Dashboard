const express = require('express');
const axios = require('axios');
const cors = require('cors');
const schedule = require('node-schedule');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/////////DISK STORAGE & CSV UPLOAD ENDPOINTS//////////

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const endpoint = req.baseUrl + req.path;
    let filename;

    if (endpoint.includes('/api/utility-upload-endpoint')) {
      filename = 'utility-ranks.csv';
    } else if (endpoint.includes('/api/socials-upload-endpoint')) {
      let weekParam = req.params.week || 'default'; 
      filename = `socialranks-week-${weekParam}.csv`; 
    } else {
      filename = 'upload.csv';
    }

    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

app.post('/api/socials-upload-endpoint/:week', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log('Uploaded: ', req.file.path);
    res.status(200).send(`File for week ${req.params.week} successfully uploaded.`);
  } else {
    res.status(400).send('Upload failed.');
  }
});

app.get('/api/available-social-weeks', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res.status(500).send('Error fetching available weeks');
    }

    const weeks = files
      .filter(file => file.startsWith('socialranks-week-') && file.endsWith('.csv'))
      .map(file => file.match(/week-(\d+)/)[1]);
    
    res.json(weeks);
  });
});

app.post('/api/utility-upload-endpoint', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log('Uploaded: ', req.file.path);
    res.status(200).send('Utility file successfully uploaded.');
  } else {
    res.status(400).send('Utility upload failed.');
  }
});


/////////COMBINED COLLECTION DATA ENDPOINT//////////

app.get('/api/collections', async (req, res) => {
  try {
      const [collectionsResponse, projectsResponse] = await Promise.all([
          axios.get('https://arc72-idx.voirewards.com/nft-indexer/v1/collections'),
          axios.get('https://test-voi.api.highforge.io/projects')
      ]);

      const collections = collectionsResponse.data.collections.map(({ contractId, totalSupply }) => ({
          contractId,
          minted: totalSupply
      }));

      const projects = projectsResponse.data.results.map(project => ({
          collectionName: project.title,
          unitName: project.unitName,
          maxSupply: project.mintTotal,
          creatorAddress: project.creatorAddress,
          coverImageUrl: project.coverImageURL,
          description: project.description,
          twitter: project.twitter,
          website: project.website,
          contractId: project.applicationID 
      }));

      const combinedData = collections.reduce((acc, collection) => {
          const project = projects.find(project => project.contractId === collection.contractId);
          if (project) {
              acc.push({ ...collection, ...project });
          }
          return acc; 
      }, []);

      res.json(combinedData);
  } catch (error) {
      console.error('Failed to fetch data:', error);
      res.status(500).send('Failed to fetch combined data');
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Api server started. Server running on port ${PORT}`);
});

