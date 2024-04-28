import { Sidebar } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { Text } from "@tremor/react";
import { Link, useLocation } from "react-router-dom";
import { HiChartBar, HiCollection, HiDatabase, HiOutlinePaperAirplane, HiShoppingCart, HiTrendingUp, HiUserGroup } from "react-icons/hi";

interface ExampleSidebarProps {
    isSidebarOpen: boolean;
}

const ExampleSidebar: FC<ExampleSidebarProps> = function ({ isSidebarOpen }) {
  const [currentPage, setCurrentPage] = useState("");
    const location = useLocation();

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location]);


  const sidebarStyle = {
    width: isSidebarOpen ? 'auto' : '0', 
    overflow: isSidebarOpen ? 'visible' : 'hidden', 
    border: isSidebarOpen ? '' : 'none', 

  };

  return (
          <Sidebar 
          aria-label="Sidebar with multi-level dropdown example" 
          collapsed={!isSidebarOpen}
          style={sidebarStyle}
                >
          <div className="flex h-full flex-col justify-between py-1">
              {isSidebarOpen && (
                  <div>
                      <Sidebar.Items>
                          <Sidebar.ItemGroup>
                          <Text className="mb-2 ml-1">Main Metrics:</Text>
                              <Sidebar.Item
                                  as={Link}
                                  to="/"
                                  icon={HiTrendingUp}
                                  className={"/" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                              >
                                  Leaderboard
                              </Sidebar.Item>
                          </Sidebar.ItemGroup>
                          <Sidebar.ItemGroup>
                      <Text className=" mb-2 ml-1">Explore:</Text>
                          <Sidebar.Item
                              as={Link}
                              to="/collections"
                              icon={HiCollection}
                              className={"/collections" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                          Collections
                          </Sidebar.Item>
                          <Sidebar.Item
                              as={Link}
                              to="/collectors"
                              icon={HiUserGroup}
                              className={"/collectors" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                          Collectors
                          </Sidebar.Item>
                          </Sidebar.ItemGroup>
                          <Sidebar.ItemGroup>
                           <Text className="mb-2 ml-1">Scores per KPI:</Text>
                          <Sidebar.Item
                              as={Link}
                              to="/primary-sales"
                              icon={HiChartBar}
                              className={currentPage.startsWith("/primary-sales") ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Primary Sales
                          </Sidebar.Item>
                          <Sidebar.Item
                              as={Link}
                              to="/market-sales"
                              icon={HiChartBar}
                              className={"/market-sales" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Market Sales
                          </Sidebar.Item>
                          <Sidebar.Item
                              as={Link}
                              to="/social-shill"
                              icon={HiChartBar}
                              className={"/social-shill" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Social Scores
                          </Sidebar.Item>
                          <Sidebar.Item
                              as={Link}
                              to="/os-utility"
                              icon={HiChartBar}
                              className={"/os-utility" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Utility Scores
                          </Sidebar.Item>
                          <Sidebar.Item
                              as={Link}
                              to="/collectors-volume"
                              icon={HiChartBar}
                              className={"/collectors-volume" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Collectors
                          </Sidebar.Item>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                      <Text className="mb-2 ml-1">Tools:</Text>
                          <Sidebar.Item  as={Link}
                              to="/tools/send-nft"
                              icon={HiOutlinePaperAirplane}
                              className={"/tools/send-nft" === currentPage ? "bg-gray-100 dark:bg-gray-700" : ""}
                          >
                              Send NFT
                          </Sidebar.Item>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                      <Text className="mb-2 ml-1">External links:</Text>
                          <Sidebar.Item href="https://nautilus.sh/" icon={HiShoppingCart}>
                              Marketplace
                          </Sidebar.Item>
                          <Sidebar.Item href="https://nft-navigator.vercel.app/" icon={HiDatabase}>
                              NFT Indexer
                          </Sidebar.Item>
                      </Sidebar.ItemGroup>
                  </Sidebar.Items>
                                </div>
                            )} 
                                </div>
      </Sidebar>
      );
};

export default ExampleSidebar;