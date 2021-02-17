const Category = require("../models/category");
const { remove } = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, cate) => {
    if (err || !cate) {
      return res.status(400).json({
        error: "Category not found",
      });
    }
    req.category = cate;
    next();
  });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, cate) => {
    if (err || !cate) {
      return res.status(400).json({
        error: "Not able to save category into the DB",
      });
    }
    res.json(cate);
  });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find({}).exec((err, cates) => {
    if (err || !cates) {
      res.status(400).json({
        error: "No Categories Found",
      });
    }
    return res.json(cates);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category; // from middleware
  category.name = req.body.name; // from frontend
  category.save((err, updatedCate) => {
    if (err || !updatedCate) {
      return res.status(400).json({
        error: "Failed to Update the category - sorry" + err,
      });
    }
    res.json(updatedCate);
  });
};

exports.removeCategory = (req, res) => {
  const category = req.category;
  category.remove((err, removedCategory) => {
    if (err || !removedCategory) {
      return res.status(400).json({
        error: "Failed to Delete the category",
      });
    }
    res.json({
      message: `Succesfully removed the '${category.name}' category`,
    });
  });
};
