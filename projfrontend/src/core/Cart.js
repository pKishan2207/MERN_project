import React, { useState, useEffect } from "react";
import "../styles.css";
import Base from "./Base";
import Card from "./Card";
import { loadCart } from "./helper/cartHelper";
import StripeCheckout from "./StripeCheckout";
import PaymentB from "./PaymentB";

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setProducts(loadCart());
  }, [reload]);

  const loadAllProducts = (products) => {
    return (
      <div>
        <h2>This section is to load all products</h2>
        {products &&
          products.map((product, index) => {
            return (
              <Card
                key={index}
                product={product}
                removeFromCart={true}
                setReload={setReload}
                reload={reload}
              />
            );
          })}
      </div>
    );
  };

  const loadCheckout = () => {
    return (
      <div>
        <h2>This section is for checkout</h2>
      </div>
    );
  };

  return (
    <Base title="Cart Page" description="Ready for checkout!">
      <div className="row text-center">
        <div className="col-6">
          {products ? loadAllProducts(products) : <h3>No Products in cart</h3>}
        </div>
        <div className="col-6">
          {loadCheckout()}
          <StripeCheckout
            products={products}
            setReload={setReload}
            reload={reload}
          />
          <h3 className="text-info p-6">Checkout via Braintree</h3>
          <PaymentB products={products} setReload={setReload} reload={reload} />
        </div>
      </div>
    </Base>
  );
};

export default Cart;
