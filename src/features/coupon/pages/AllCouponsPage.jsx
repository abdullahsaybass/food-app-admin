// features/coupon/pages/AllCouponsPage.jsx
// Redirect to AddCouponPage which contains both form and list (as per screenshot)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AllCouponsPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/coupons/add", { replace: true }); }, [navigate]);
  return null;
};

export default AllCouponsPage;
