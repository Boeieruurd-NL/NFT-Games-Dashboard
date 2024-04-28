import type { FC } from "react";
import { Card } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import { AddressRankings } from "../components/CollectorsVolumePage/TableRankings";
import { Metric, Text, Badge } from "@tremor/react";


const CollectorsVolumePage: FC = function () {
  
  return (
    <NavbarSidebarLayout>
            <div className="mt-6 mx-6">
            <Card className="mb-6 text-center items-center">
          <Metric className='font-bold'>Collector Volume Scores</Metric>
          <Text className='mt-2 mb-2'>The content of this table is updated live as sales happen within a specific week.</Text>
          <Text className='mt-2 mb-4'>The content of this table is subject to change, and no rewards are final.</Text>
          <Badge className='mr-2' color='indigo'>Total Rewards: 10,000,000 VIA</Badge><Badge className='ml-2' color='indigo'>Weekly Rewards: 2,000,000 VIA</Badge>
        </Card>
              <Card>
                <AddressRankings/>
              </Card>
            </div>
    </NavbarSidebarLayout>
  );
};

export default CollectorsVolumePage;
