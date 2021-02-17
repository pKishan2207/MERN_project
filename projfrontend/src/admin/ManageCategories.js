import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../auth/helper";
import {  getAllCategories, deleteCategory } from "./helper/adminapicall";

const ManageCategories = () => {
  const { user, authToken } = isAuthenticated();
  const [categories, setCategories] = useState([]);

  const preload = () => {
    getAllCategories().then((data) => {
      //   console.log(data);
      if (data.error) {
        console.log("preload - ", data.error);
      } else {
        setCategories(data);
      }
    });
  };

  useEffect(() => {
    preload();
  }, []);

  const deleteThisCategory = (categoryId) => {
    deleteCategory(categoryId, user._id, authToken).then((data) => {
      if (data.error) {
        console.log("deleteThisCategory - ", data.error);
      } else {
        preload();
      }
    });
  };

  return (
    <Base
      title="Managar your Categories"
      description="One place to all of your categories"
    >
      <h2 className="mb-4">All Categories: </h2>
      <Link className="btn btn-info" to={`/admin/dashboard`}>
        <span>Admin Home</span>
      </Link>
      <div className="row">
        <div className="col-12">
          <h2 className="text-center text-white my-3">
            Total {categories.length} categories
          </h2>
          {categories &&
            categories.map((category, index) => {
              return (
                <div key={index} className="row text-center mb-2">
                  <div className="col-4">
                    <h3 className="text-white text-left">{category.name}</h3>
                  </div>
                  <div className="col-4">
                    <Link
                      className="btn btn-success"
                      to={`/admin/category/update/${category._id}`}
                    >
                      <span className="">Update</span>
                    </Link>
                  </div>
                  <div className="col-4">
                    <button
                      onClick={() => {
                        deleteThisCategory(category._id);
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

export default ManageCategories;
