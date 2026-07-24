import { Outlet } from "react-router-dom";
import PublicHeader from "./Component/PublicHeader";
import OffersSideTab from "./Component/OffersSideTab";

export default function StoreLayout() {
  return (
    <>
      <PublicHeader />
      <OffersSideTab />
      <Outlet />
    </>
  );
}
