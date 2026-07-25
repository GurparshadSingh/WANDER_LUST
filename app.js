const express = require("express");
const app = express();
const port = 8080;

const mongoose = require('mongoose');
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema } = require("./schema.js")
const { reviewSchema } = require("./schema.js")
const Review = require("./models/reviews.js");


if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const dburl = process.env.ATLASDB_URL
console.log(`Hello ${process.env.HELLO}`)

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

const session = require("express-session")
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")))

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: "mysupersecretcode"
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("error on session store");
})

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}

app.use(session(sessionOptions));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// console.log(process.env.ATLASDB_URL);
async function main() {
    await mongoose.connect(dburl);
}

main().then(() => {
    console.log("connected to db ");
})
    .catch((err) => {
        console.log(err)
    })



// //*root
// app.get("/", (req, res) => {
//     res.send("i'm root")
// })
// //*demo user
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings", listingsRouter)
app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter)

app.all("/{*any}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error", {
        message
    });
});


app.listen(8080, () => {
    console.log(`app is listening at port ${port}`);
});