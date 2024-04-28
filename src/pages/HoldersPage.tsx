import type { FC } from "react";
import { useState } from "react";
import { Card, Metric, Text, Badge } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import HoldersGrid from "../components/holdersPage/holdersGrid";



const HoldersPage: FC = function () {
  const [holdersCount, setHoldersCount] = useState(0);

  return (
    <NavbarSidebarLayout>
      <div className="mt-6 mx-6">
      <Card className="mb-6 text-center items-center">
          <Metric className='font-bold'>Collectors Overview</Metric>
          <Text className='mt-2 mb-4'>You can use the content of this page to see who holds which tokens from what collection.</Text>
          <Text className='mt-2 mb-4'>Note that loading can take up to 10 seconds.</Text>
          <Badge color='indigo'>Total Collectors: {holdersCount}</Badge>
        </Card>
        <HoldersGrid onHoldersCountChange={setHoldersCount} />
      </div>
    </NavbarSidebarLayout>
  );
};

export default HoldersPage;
