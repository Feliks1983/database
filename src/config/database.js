const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");
dotenv.config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI не найден в .env");
}

const isProduction = process.env.NODE_ENV === "production";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
});

let db;
let todosCollection;
let isConnected = false;
let lastError = null;

function getConnectionStatus() {
  return {
    connected: isConnected,
    database: isConnected ? db.databaseName : null,
    error: lastError,
  };
}

function getTodosCollection (){
  if(!isConnected || !todosCollection) {
    throw new Error("BD Error")
  }
  return todosCollection
}

async function connectOnce() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  db = client.db("todoapp");
  todosCollection = db.collection("todos");

  isConnected = true;
  lastError = null;

  console.log("Connected to MongoDB!");
  console.log("Database:", db.databaseName);
  console.log("Collection:", todosCollection.collectionName);
}

async function connectDB() {
  if (!isProduction) {
    try {
      await connectOnce();
    } catch (error) {
      isConnected = false;
      lastError = error.message;
      console.error("MongoDB connection error:", error.message);
      console.warn("Продолжаем без БД (dev режим) — /health сообщит об этом");
    }
    return { client, db, todosCollection };
  }

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await connectOnce();
      return { client, db, todosCollection };
    } catch (error) {
      attempt++;
      isConnected = false;
      lastError = error.message;

      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed:`,
        error.message,
      );

      if (attempt >= maxRetries) {
        console.error("Достигнут лимит попыток подключения к MongoDB");
        process.exit(1);
      }

      const delay = Math.min(1000 * 2 ** attempt, 30000);
      console.log(`Повтор через ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { connectDB, client, getConnectionStatus, getTodosCollection };
