const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category") // doubt ?? (section 10, video 2)
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    //destructre the fields
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all the Fields",
      });
    }
    /* above code can be converted to express validation like in auth.js route */

    let product = new Product(fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3 * 1024 * 1024) {
        return res.status(400).json({
          error: "File too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to DB
    product.save((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Saving product in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

// middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    // updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file
    if (file.photo) {
      if (file.photo.size > 3 * 1024 * 1024) {
        return res.status(400).json({
          error: "File too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to DB
    product.save((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Updation of product failed",
        });
      }
      res.json(product);
    });
  });
};

exports.removeProduct = (req, res) => {
  const product = req.product;
  product.remove((err, removedProduct) => {
    if (err || !removedProduct) {
      return res.status(400).json({
        error: "Failed to Delete the Product",
      });
    }
    res.json({
      message: `Succesfully removed the product`,
      removedProduct,
    });
  });
};

exports.getAllProducts = (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 8;
  const sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find({})
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err || !products) {
        return res.status(400).json({
          error: "No Products found",
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err || !categories) {
      res.status(400).json({
        error: "No Categories found (unique operation)",
      });
    }
    res.json(categories);
  });
};

exports.updateStock = (req, res, next) => {
  const myOps = req.body.order.products?.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -product.count, sold: +product.count } },
      },
    };
  });

  Product.bulkWrite(myOps, {}, (err, products) => {
    if (err || !products) {
      return res.status(400).json({
        error: "Bulk operations failed",
      });
    }
    next();
  });
};
