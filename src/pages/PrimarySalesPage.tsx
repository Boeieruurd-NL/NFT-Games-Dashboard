import type { FC } from "react";
import { Card, Text, Metric, Badge } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { TableRankings } from "../components/PrimarySalesPage/TableRankings";


const PrimarySalesPage: FC = function () {
  return (
    <NavbarSidebarLayout>
    <div className="mt-6 mx-6">
    <Card className="mb-6 text-center items-center">
        <Metric className='font-bold'>Primary Sale Scores</Metric>
        <Text className='mt-2 mb-2'>The content of this table is provided by High Forge. Rewards are paid out once.</Text>
        <Text className='mt-2 mb-2'>The number of points in this table will count towards the general leaderboard.</Text>
        <Text className='mt-2 mb-4'>The content of this table is subject to change, and no rewards are final.</Text>
        <Badge color='indigo'>Total Rewards: 6,250,000 VIA</Badge>
      </Card>
      <Card>
        <TableRankings/>
      </Card>
    </div>
  </NavbarSidebarLayout>
);
};

export default PrimarySalesPage;

