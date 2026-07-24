import { Outlet } from "react-router-dom";
import PublicHeader from "./Component/PublicHeader";
import OffersSideTab from "./Component/OffersSideTab";

export default function CartLayout() {
  return (
    <>
      <PublicHeader />
      <OffersSideTab />
      <Outlet />
    </>
  );
}
