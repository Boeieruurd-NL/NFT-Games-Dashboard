import type { FC } from "react";
import { Card, Metric, Text, Badge } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { TableRankings } from "../components/SocialShillPage/TableRankings";

const SocialShillPage: FC = function () {
  return (
    <NavbarSidebarLayout>
      <div className="mt-6 mx-6">
      <Card className="mb-6 text-center items-center">
          <Metric className='font-bold'>Social Impressions Scores</Metric>
          <Text className='mt-2 mb-2'>The content of this table is updated & reset weekly by the foundation. Rewards are paid out each week.</Text>
          <Text className='mt-2 mb-2'>The total number of points accross all weeks will count towards the general leaderboard.</Text>
          <Text className='mt-2 mb-4'>The content of this table is subject to change, and no rewards are final.</Text>
          <Badge className='mr-2' color='indigo'>Total Rewards: 21,875,000 VIA</Badge><Badge className='ml-2' color='indigo'>Weekly Rewards: 2,430,555 VIA</Badge>
        </Card>
        <Card>
          <TableRankings/>
        </Card>
      </div>
    </NavbarSidebarLayout>
  );
};

export default SocialShillPage;