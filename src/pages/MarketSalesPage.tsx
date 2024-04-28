import type { FC } from "react";
import { Card } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { TableRankings } from "../components/SecondarySalesPage/TableRankings";
import { Metric, Text, Badge } from "@tremor/react";


const MarketSalesPage: FC = function () {
  
  return (
    <NavbarSidebarLayout>
            <div className="mt-6 mx-6">
            <Card className="mb-6 text-center items-center">
          <Metric className='font-bold'>Secondary Sales Scores</Metric>
          <Text className='mt-2 mb-2'>The content of this table is updated live as sales happen within a specific week. Rewards are paid out each week.</Text>
          <Text className='mt-2 mb-2'>The total number of points accross all weeks will count towards the general leaderboard.</Text>
          <Text className='mt-2 mb-2'>The content of this table is subject to change, and no rewards are final.</Text>
          <Text className='mt-2 mb-4'>Only sales of 50k+ Via or Voi are counted.</Text>
          <Badge className='mr-2' color='indigo'>Total Rewards: 12,500,000 VIA</Badge><Badge className='ml-2' color='indigo'>Weekly Rewards: 1,388,888 VIA</Badge>
        </Card>
              <Card>
                <TableRankings/>
              </Card>
            </div>
    </NavbarSidebarLayout>
  );
};

export default MarketSalesPage;
