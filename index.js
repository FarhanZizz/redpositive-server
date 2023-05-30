const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5000
require("dotenv").config()

// MiddleWare
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0hszsm.mongodb.net/?retryWrites=true&w=majority`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const dataCollection = client.db("redpositive").collection("data")

    app.get("/get-data", async (req, res) => {
      try {
        const data = await dataCollection.find({}).toArray()
        res.status(200).json(data)
      } catch (error) {
        console.error("An error occurred while retrieving data:", error)
        res.status(500).json({ error: "Internal Server Error" })
      }
    })

    app.post("/add-data", async (req, res) => {
      try {
        const { name, email, phone, hobbies } = req.body
        const data = {
          name,
          email,
          phone,
          hobbies,
        }
        const result = await dataCollection.insertOne(data)
        res.status(200).json(result)
      } catch (error) {
        console.error("An error occurred while adding data:", error)
        res.status(500).json({ error: "Internal Server Error" })
      }
    })
    app.patch("/update-data/:id", async (req, res) => {
      try {
        const id = req.params.id
        const { name, email, phone, hobbies } = req.body
        const query = { _id: new ObjectId(id) }
        const update = {
          $set: {
            name,
            email,
            phone,
            hobbies,
          },
        }
        const result = await dataCollection.updateOne(query, update)
        if (result.matchedCount === 1) {
          res.status(200).json({ message: "Data updated successfully" })
        } else {
          res.status(404).json({ error: "Data not found" })
        }
      } catch (error) {
        console.error("An error occurred while updating data:", error)
        res.status(500).json({ error: "Internal Server Error" })
      }
    })

    app.delete("/delete-data/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await dataCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
  }
}

run().catch((err) => console.log(err))

app.get("/", (req, res) => {
  res.send("server running")
})

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
