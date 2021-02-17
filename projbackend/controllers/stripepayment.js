require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);
const uuid = require("uuid/v4");

exports.makepayment = (req, res) => {
  const { products, token } = req.body;
  // console.log("PRODUCTS", products, "\nTOKEN", token);
  const total = products
    ? products.reduce((sum, prod) => sum + prod.price, 0)
    : 0;
  const idempotencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges
        .create(
          {
            amount: total * 100,
            currency: "usd",
            customer: customer.id,
            receipt_email: token.email,
            description: `Test account`,
            shipping: {
              name: token.card.name,
              address: {
                line1: token.card.address_line1,
                city: token.card.address_city,
                country: token.card.address_country,
                postal_code: token.card.address_zip,
              },
            },
          },
          { idempotencyKey }
        )
        .then((result) => res.status(200).json(result))
        .catch((err) => console.log("ERROR", err));
    });
};
