import { createRoot } from "react-dom/client";
import "./theme/index.css";
import theme from "./theme/flowbite-theme";
import { Flowbite } from "flowbite-react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import SummaryPage from "./pages/SummaryPage";
import MarketSalesPage from "./pages/MarketSalesPage";
import SocialShillPage from "./pages/SocialShillPage";
import OsUtilityPage from "./pages/OsUtilityPage";
import PrimarySalesPage from "./pages/PrimarySalesPage";
import CSVUploadPage from "./pages/CSVUploadPage";
import CollectionOverviewPage from "./pages/CollectionPages/CollectionOverviewPage";
import CollectionDetailsPage from "./pages/CollectionPages/CollectionDetailPage";
import HoldersPage from "./pages/HoldersPage";
import SendNFTPage from "./pages/SendNFTPage";
import CollectorsVolumePage from "./pages/CollectorsVolumePage";



const container = document.getElementById("root");

if (!container) {
  throw new Error("React root element doesn't exist!");
}

const root = createRoot(container);

root.render(
  <Flowbite theme={{ theme }}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SummaryPage />} index />
        <Route path="/primary-sales" element={<PrimarySalesPage />}/>
        <Route path="/market-sales" element={<MarketSalesPage />}/>
        <Route path="/social-shill" element={<SocialShillPage />}/>
        <Route path="/collectors-volume" element={<CollectorsVolumePage />}/>
        <Route path="/os-utility" element={<OsUtilityPage />}/>
        <Route path="/csv-upload" element={<CSVUploadPage />}/>
        <Route path="/collections" element={<CollectionOverviewPage />}/>
        <Route path="/collections/:collectionId" element={<CollectionDetailsPage />}/>
        <Route path="/collectors" element={<HoldersPage />}/>
        <Route path="/tools/send-nft" element={<SendNFTPage />}/>

        
      </Routes>
    </BrowserRouter>
  </Flowbite>
);

