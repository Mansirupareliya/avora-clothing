import { Outlet } from "react-router-dom";
import PublicHeader from "./Component/PublicHeader";

export default function CartLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
