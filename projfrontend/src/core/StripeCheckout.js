import React, { useState } from "react";
import { isAuthenticated } from "../auth/helper";
import { Link } from "react-router-dom";
import StripeCheckoutComponent from "react-stripe-checkout";
import { makeStripePayment } from "./helper/coreapicalls";
import { createOrder } from "./helper/orderHelper";
import { emptyCart } from "./helper/cartHelper";

const StripeCheckout = ({
  products,
  setReload = (f) => f,
  reload = undefined,
}) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    error: "",
    address: "",
  });

  const authToken = isAuthenticated() && isAuthenticated().authToken;
  const userId = isAuthenticated() && isAuthenticated().user._id;

  const getTotal = () => {
    return products ? products.reduce((sum, prod) => sum + prod.price, 0) : 0;
  };

  const makePayment = (token) => {
    makeStripePayment({ token, products }).then((data) => {
      if (data.error) {
        setData({ ...data, error: data.error, loading: false });
      } else {
        // console.log("DATA", data);
        const { status } = data;
        emptyCart(() => {
          setReload(!reload);
        });
        // TODO: set order data
      }
    });
  };

  const showStripeButton = () => {
    return isAuthenticated() ? (
      <StripeCheckoutComponent
        stripeKey={process.env.REACT_APP_STRIPE_KEY}
        token={makePayment}
        name="Payment Gateway"
        amount={getTotal() * 100}
        shippingAddress
        billingAddress
      >
        <button className="btn btn-secondary" disabled>
          Pay with stripe
        </button>
      </StripeCheckoutComponent>
    ) : (
      <Link to="/signin">
        <button className="btn btn-info">Sign in</button>
      </Link>
    );
  };

  return (
    <div>
      <h3 className="text-white">Stripe checkout {getTotal()} ...</h3>
      {showStripeButton()}
    </div>
  );
};

export default StripeCheckout;
