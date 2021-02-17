import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link, Redirect } from "react-router-dom";
import { getAllCategories, createProduct } from "./helper/adminapicall";
import { isAuthenticated } from "../auth/helper/index";

const AddProduct = () => {
  const { user, authToken } = isAuthenticated();

  const [values, setValues] = useState({
    photo: "",
    name: "",
    description: "",
    price: "",
    categories: [],
    category: "",
    stock: "",
    error: "",
    loading: false,
    createdProduct: "",
    getRedirect: false,
    formData: "",
  });

  const {
    photo,
    name,
    description,
    price,
    categories,
    category,
    stock,
    error,
    loading,
    createdProduct,
    getRedirect,
    formData,
  } = values;

  const preload = () => {
    getAllCategories().then((data) => {
      // console.log(data);
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({ ...values, categories: data, formData: new FormData() });
        // console.log(categories);
      }
    });
  };

  useEffect(() => {
    preload();
  }, []);

  useEffect(() => {
    if (getRedirect) {
      const time = setTimeout(() => setValues({ getRedirect: 1 }), 3000);
      return () => {
        clearTimeout(time);
      };
    }
  }, [getRedirect]);

  const handleChange = (data) => (event) => {
    const value = data === "photo" ? event.target.files[0] : event.target.value;
    formData.set(data, value);
    setValues({
      ...values,
      error: false,
      loading: false,
      [data]: value,
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: "", loading: true });
    createProduct(user._id, authToken, formData)
      .then((data) => {
        if (data.error) {
          setValues({ ...values, error: data.error, loading: false });
        } else {
          setValues({
            ...values,
            photo: "",
            name: "",
            description: "",
            price: "",
            stock: "",
            error: false,
            loading: false,
            createdProduct: data.name,
            getRedirect: true
          });
        }
      })
      .catch((err) => console.log("Error is AddProduct - onSubmit() - ", err));
  };

  const successMessage = () => {
    return (
      <div
        className="alert alert-success mt-3"
        style={{ display: createdProduct ? "" : "none" }}
      >
        <h4>{createdProduct} created successfully</h4>
        <h6 className="text-right text-info">Redirecting...</h6>
      </div>
    );
  };

  const loadingMessage = () => {
    return (
      loading && (
        <div className="alert alert-info mt-3">
          <h2>Loading...</h2>
        </div>
      )
    );
  };

  const failureMessage = () => {
    return (
      <div
        className="alert alert-danger"
        style={{ display: error ? "" : "none" }}
      >
        {error}
      </div>
    );
  };

  const redirect = () => {
    if (getRedirect === 1) return <Redirect to="/admin/dashboard" />;
  };

  const createProductForm = () => (
    <form>
      <span>Post photo</span>
      <div className="form-group">
        <label className="btn btn-block btn-success">
          <input
            onChange={handleChange("photo")}
            type="file"
            name="photo"
            accept="image"
            placeholder="choose a file"
          />
        </label>
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("name")}
          className="form-control"
          placeholder="Name"
          value={name}
        />
      </div>
      <div className="form-group">
        <textarea
          onChange={handleChange("description")}
          className="form-control"
          placeholder="Description"
          value={description}
        />
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("price")}
          type="number"
          className="form-control"
          placeholder="Price"
          value={price}
        />
      </div>
      <div className="form-group">
        <select
          onChange={handleChange("category")}
          className="form-control"
          placeholder="Category"
        >
          <option>Select</option>
          {categories &&
            categories.map((cate, index) => (
              <option key={index} value={cate._id}>
                {cate.name}
              </option>
            ))}
        </select>
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("stock")}
          type="number"
          className="form-control"
          placeholder="Quantity"
          value={stock}
        />
      </div>

      <button
        type="submit"
        onClick={onSubmit}
        className="btn btn-outline-success mb-3"
      >
        Create Product
      </button>
    </form>
  );

  return (
    <Base
      title="Add Product here!"
      description="Welcome to product creation area"
      className="conatiner bg-info p-4"
    >
      <Link className="btn btn-sm btn-dark mb-3" to="/admin/dashboard">
        Admin Home
      </Link>
      <div className="row bg-dark text-white rounded">
        <div className="col-md-8 offset-md-2">
          {successMessage()}
          {loadingMessage()}
          {failureMessage()}
          {redirect()}
          {createProductForm()}
        </div>
      </div>
    </Base>
  );
};

export default AddProduct;
