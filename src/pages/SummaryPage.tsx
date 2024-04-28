import type { FC } from "react";
import { Card, Text, Metric, Badge } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { TableRankings } from "../components/SummaryPage/TableRankings";


const summaryPage: FC = function () {
  
  return (
    <NavbarSidebarLayout>
            <div className="m-6">
            <Card className="mb-6 text-center items-center">
        <Metric className='font-bold'>Summary Leaderboard</Metric>
        <Text className='mt-2 mb-2'>The content of this table is updated dynamically based upon the points gained in the 4 individual games.</Text>
        <Text className='mt-2 mb-2'>While each game has rewards of its own, the top 30 in this leaderboard are eligible for bonus rewards.</Text>
        <Text className='mt-2 mb-2'>The content of this table is subject to change, and no rewards are final.</Text>
        <Text className='mt-2 mb-4'>Ties are not ranked correctly yet.</Text>
        
        <Badge color='indigo'>Total Bonus Rewards: 67,647,187 VIA</Badge>
      </Card>
              <Card>
              <TableRankings/>
              </Card>
            </div>
    </NavbarSidebarLayout>
  );
};

export default summaryPage;

