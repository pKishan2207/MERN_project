const User = require("../models/user");
const Order = require("../models/order");
const { eq } = require("lodash");

// a middleware, that is called everytime when id is passed in url
exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No User Found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.updatedAt = undefined;
  req.prodile.createdAt = undefined;
  res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.prodile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err || !user) {
        res.status(400).json({
          error: "You are not authorize to update the database",
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      user.updatedAt = undefined;
      user.createdAt = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No Order in this account",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products?.forEach((prod) => {
    purchases.push({
      _id: prod._id,
      name: prod.name,
      description: prod.description,
      category: prod.category,
      quantity: prod.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });

  // store data in db
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    { new: true },
    (err, purchases) => {
      if (err || !purchases) {
        return res.status(400).json({
          error: "Unable to save purchase list",
        });
      }
      next();
    }
  );
};

/* ***
exports.getAllUsers = (req, res) => {
    User.find().exec((err, users) => {
        if(err || !users) {
            return res.status(400).json({
                error: "No Users found"
            });
        }
        return res.json(users);
    });
}
*/
