import { FC } from "react";
import { Grid } from "@tremor/react";
import NavbarSidebarLayout from "../layouts/navbar-sidebar";
import SendNFT from "../components/sendNftPage/SendNft";


const SendNFTPage: FC = function () {

  return (
    <NavbarSidebarLayout>
      <Grid numItemsSm={1} numItemsLg={1} className="gap-6  m-6"> 
          <SendNFT/>
      </Grid>
    </NavbarSidebarLayout>
  );
};

export default SendNFTPage;