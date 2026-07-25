const express = require("express");
const router = express.Router();
const Listing = require("../models/listings.js");
const wrapAsync = require("../utils/wrapAsync.js")
const { listingSchema } = require("../schema.js")
const ExpressError = require("../utils/ExpressError.js")
const { isLoggedIn } = require("../middleware.js")
const { isOwner } = require("../middleware.js")
const { isAuthor } = require("../middleware.js")
const multer = require('multer')
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { err } = listingSchema.validate(req.body);

    if (err) {
        let errMsg = err.details.map((el) => el.message.join(","));
        throw new ExpressError(404, err)
    } else {
        next()
    }
}

const listingController = require("../controllers/listing.js")

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing))
    // .post(upload.single("listing[image]"), (req, res) => {
    //     res.send(req.file);
    // });


//* index route
// router.get("/", wrapAsync(listingController.index));

//*new route
router.get("/new", isLoggedIn, listingController.renderNewForm)

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//*create route
// router.post("/", validateListing, wrapAsync(listingController.createListing))

//*show route
// router.get("/:id", wrapAsync(listingController.showListing))

//*Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing))

//*update route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))

//*destroy route
// router.delete("/:id", isLoggedIn, isAuthor, isOwner, wrapAsync(listingController.deleteListing));


module.exports = router;