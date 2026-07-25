const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listings.js")
require('dotenv').config();
async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
}

main().then(() => {
    console.log("connected to db ");
})
    .catch((err) => {
        console.log(err)
    })

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj) => ({ ...obj, owner: "6a4e0b50825e9bb64ffb04cd" }))
    await Listing.insertMany(initdata.data);
    console.log("data was initialized")
}

initDB();