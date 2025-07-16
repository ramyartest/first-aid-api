const { MongoClient } = require("mongodb");

async function insertUser() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = client.db("firstAidDB");

  const result = await db.collection("users").insertOne({
    name: "Ramya R",
    email: "ramya@example.com",
    phone: "+91XXXXXXXXXX",
    location: { lat: 12.9716, lng: 77.5946 },
    history: [],
    createdAt: new Date(),
    role: "user"
  });

  console.log("✅ New user inserted.");
  console.log("🆔 User ID:", result.insertedId.toString());

  await client.close();
}
insertUser();
