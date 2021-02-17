import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../auth/helper";
import { getAllProducts, deleteProduct } from "./helper/adminapicall";

const ManageProducts = () => {
  const { user, authToken } = isAuthenticated();
  const [products, setProducts] = useState([]);

  const preload = () => {
    getAllProducts().then((data) => {
      //   console.log(data);
      if (data.error) {
        console.log("preload - ", data.error);
      } else {
        setProducts(data);
      }
    });
  };

  useEffect(() => {
    preload();
  }, []);

  const deleteThisProduct = (productId) => {
    deleteProduct(productId, user._id, authToken).then((data) => {
      if (data.error) {
        console.log("deleteThisProduct - ", data.error);
      } else {
        preload();
      }
    });
  };

  return (
    <Base
      title="Managar your Products"
      description="One place to all your products"
    >
      <h2 className="mb-4">All Products: </h2>
      <Link className="btn btn-info" to={`/admin/dashboard`}>
        <span>Admin Home</span>
      </Link>
      <div className="row">
        <div className="col-12">
          <h2 className="text-center text-white my-3">
            Total {products.length} products
          </h2>
          {products &&
            products.map((product, index) => {
              return (
                <div key={index} className="row text-center mb-2">
                  <div className="col-4">
                    <h3 className="text-white text-left">{product.name}</h3>
                  </div>
                  <div className="col-4">
                    <Link
                      className="btn btn-success"
                      to={`/admin/product/update/${product._id}`}
                    >
                      <span className="">Update</span>
                    </Link>
                  </div>
                  <div className="col-4">
                    <button
                      onClick={() => {
                        deleteThisProduct(product._id);
                      }}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Base>
  );
};

export default ManageProducts;
