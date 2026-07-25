const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listings.js");
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema } = require("../schema.js")
const { reviewSchema } = require("../schema.js")
const Review = require("../models/reviews.js");

const reviewController = require("../controllers/review.js")
const { isLoggedIn } = require("../middleware.js")
const { isOwner } = require("../middleware.js")
const { isAuthor } = require("../middleware.js")
const validateReview = (req, res, next) => {
    let { err } = reviewSchema.validate(req.body);

    if (err) {
        let errMsg = err.details.map((el) => el.message.join(","));
        throw new ExpressError(404, err)
    } else {
        next()
    }
}

//*post review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.postReview))
//*review delete route
router.delete("/:reviewId", isLoggedIn, isAuthor, isOwner, wrapAsync(reviewController.deleteReview));


module.exports = router;