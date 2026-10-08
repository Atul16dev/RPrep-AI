const mongoose = require("mongoose")


async function connectToDB(){

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            family: 4
        })

        console.log("Connected to Database")

    } catch (error) {
        
        console.error("Database connection failed:", error.message)
        throw error

    }
}

module.exports = connectToDB;