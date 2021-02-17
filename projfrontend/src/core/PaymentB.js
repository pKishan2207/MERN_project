import React, { useEffect, useState } from "react";
import { emptyCart } from "./helper/cartHelper";
import { Link } from "react-router-dom";
import { getUserToken, processUserPayment } from "./helper/paymentBHelper";
import { createOrder } from "./helper/orderHelper";
import { isAuthenticated } from "../auth/helper";
import DropIn from "braintree-web-drop-in-react";

const PaymentB = ({ products, setReload = (f) => f, reload = undefined }) => {
  const { user, authToken } = isAuthenticated();

  const [info, setInfo] = useState({
    clientToken: null,
    loading: false,
    success: false,
    error: "",
    instance: {},
  });

  const getToken = (userId, token) => {
    getUserToken(userId, token).then((info) => {
      //   console.log("INFO", info);
      if (info.error) {
        setInfo({ ...info, error: info.error });
      }
      const clientToken = info.clientToken;
      setInfo({ clientToken });
    });
  };

  useEffect(() => {
    getToken(user._id, authToken);
  }, []);

  const getTotal = () => {
    return products ? products.reduce((sum, prod) => sum + prod.price, 0) : 0;
  };

  const makePayment = () => {
    setInfo({ loading: true });
    let nonce;
    let getNonce = info.instance.requestPaymentMethod().then((data) => {
      nonce = data.nonce;
      const paymentData = {
        paymentMethodNonce: nonce,
        amount: getTotal(),
      };
      processUserPayment(user._id, authToken, paymentData)
        .then((response) => {
          setInfo({ ...info, success: response.success, loading: false });
          console.log("PAYMENT SUCCESS");
          const orderData = {
            products: products,
            transaction_id: response.transaction.id,
            amount: response.transaction.amount,
          };
          createOrder(user._id, authToken, orderData);
          emptyCart(() => {
            setReload(!reload);
          });
        })
        .catch((err) => {
          setInfo({ loading: false, success: false, error: err });
          console.log("PAYMENT FAILED");
        });
    });
  };

  const showDropIn = () => {
    return (
      <div>
        {info.clientToken !== null && products?.length > 0 ? (
          <div>
            <DropIn
              options={{ authorization: info.clientToken }}
              onInstance={(instance) => (info.instance = instance)}
            />
            <button className="btn btn-success btn-block" onClick={makePayment}>
              Buy
            </button>
          </div>
        ) : (
          <div>
            <h1>Loading...</h1>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3>Your bill is $ {getTotal()}</h3>
      {showDropIn()}
    </div>
  );
};

export default PaymentB;
