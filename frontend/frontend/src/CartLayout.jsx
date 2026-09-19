import { Outlet } from "react-router-dom";
import PublicHeader from "./Component/PublicHeader";
import OffersSideTab from "./Component/OffersSideTab";
import BottomNav from "./Component/BottomNav";

export default function CartLayout() {
  return (
    <>
      <PublicHeader />
      <OffersSideTab />
      <div className="pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
