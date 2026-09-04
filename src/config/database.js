const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI не найден в .env");
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let todos;
let isConnected = false;
function getTodosCollection() {
  if (!isConnected || !todos) {
    throw new Error("BD Error");
  }
  return todos;
}

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("todoapp");
    todos = db.collection("todos");
     isConnected = true;
    console.log("Connected to MongoDB!");
    console.log("Database:", db.databaseName);
    console.log("Collection:", todos.collectionName);
    return {
      connected: true,
      db,
      todos,
    };
  } catch (error) {
    console.error("Connection error:", error);
  }
}
module.exports = { connectDB, getTodosCollection };
