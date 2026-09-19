import { Outlet, useLocation } from "react-router-dom";
import PublicHeader from "./Component/PublicHeader";
import OffersSideTab from "./Component/OffersSideTab";
import BottomNav from "./Component/BottomNav";

export default function StoreLayout() {
  const location = useLocation();
  // Account page has its own header (hamburger + avatar that opens its
  // sidebar) - skip the site-wide header there so they don't double up.
  const isAccountPage = location.pathname.startsWith("/store/account");

  return (
    <>
      {isAccountPage ? (
        <div className="hidden md:block"><PublicHeader /></div>
      ) : (
        <PublicHeader />
      )}
      <OffersSideTab />
      <div className="pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
