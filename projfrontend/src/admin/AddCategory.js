import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { isAuthenticated } from "../auth/helper";
import { Link, Redirect } from "react-router-dom";
import { createCategory } from "./helper/adminapicall";

const AddCategory = () => {
  const { user, authToken } = isAuthenticated();

  const [values, setValues] = useState({
    name: "",
    error: "",
    loading: false,
    createdCategory: "",
    getRedirect: false,
  });

  const { name, error, loading, createdCategory, getRedirect } = values;

  const goBack = () => {
    return (
      <div className="mt-5">
        <Link className="btn btn-sm btn-success mb-3" to="/admin/dashboard">
          Admin Home
        </Link>
      </div>
    );
  };

  useEffect(() => {
    if (getRedirect) {
      const time = setTimeout(() => setValues({ getRedirect: 1 }), 3000);
      return () => {
        clearTimeout(time);
      };
    }
  }, [getRedirect]);

  const handleChange = (data) => (event) => {
    setValues({
      ...values,
      error: false,
      loading: false,
      [data]: event.target.value,
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: "", loading: true });

    // backend  request fire
    createCategory(user._id, authToken, { name }).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, loading: false });
      } else {
        setValues({
          error: "",
          name: "",
          createdCategory: data.name,
          getRedirect: true,
        });
      }
    });
  };

  const successMessage = () => {
    return (
      <div
        className="alert alert-success mt-3"
        style={{ display: createdCategory ? "" : "none" }}
      >
        <h4>{createdCategory} created successfully</h4>
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

  const createCategoryForm = () => {
    return (
      <form>
        <div className="form-group">
          <p className="lead mt-3">Enter the category</p>
          <input
            type="text"
            className="form-control my-3"
            onChange={handleChange("name")}
            value={name}
            autoFocus
            required
            placeholder="Eg. Summer"
          />
          <button onClick={onSubmit} className="btn btn-outline-info">
            Create Category
          </button>
        </div>
      </form>
    );
  };

  return (
    <Base
      title="Create a Category"
      description="Add new category for the store"
      className="container bg-info p-4"
    >
      <Link className="btn btn-sm btn-dark mb-3" to="/admin/dashboard">
        Admin Home
      </Link>
      <div className="row bg-white rounded">
        <div className="col-md-8 offset-md-2">
          {successMessage()}
          {loadingMessage()}
          {failureMessage()}
          {redirect()}
          {createCategoryForm()}
        </div>
      </div>
      {/* <p className="text-white bg-danger text-center">{name}, {error}, {success}</p> */}
    </Base>
  );
};

export default AddCategory;
