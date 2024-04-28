import type { FC } from "react";
import { Card, Metric, Text, Badge } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { TableRankings } from "../components/OsUtilityPage/TableRankings";

const OsUtilityPage: FC = function () {
  return (
    <NavbarSidebarLayout>
      <div className="mt-6 mx-6">
      <Card className="mb-6 text-center items-center">
          <Metric className='font-bold'>Open Source Utility Scores</Metric>
          <Text className='mt-2 mb-2'>The content of this table is statically updated by the foundation. Rewards are paid out once.</Text>
          <Text className='mt-2 mb-2'>The number of points in this table will count towards the general leaderboard.</Text>
          <Text className='mt-2 mb-4'>The content of this table is subject to change, and no rewards are final.</Text>
          <Badge color='indigo'>Total Rewards: 21,875,000 VIA</Badge>
        </Card>
        <Card>
          <TableRankings/>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default OsUtilityPage;
