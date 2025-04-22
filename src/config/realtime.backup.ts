import mongoose from "mongoose";
import connection from "./db";
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/?replicaSet=rs0";
const sourceDbName = "ffa";
const backupDbName = "backupdb";

export const realTimeBackup = async () => {
  try {
    await connection(); // your mongoose connection wrapper

    if (!mongoose.connection.db) {
      console.log("❌ Could not find source DB");
      return;
    }

    const backupClient = new MongoClient(uri);
    await backupClient.connect();
    console.log("✅ MongoClient connected to backupdb");

    const backupDb = backupClient.db(backupDbName);

    // Watch all collections in the DB
    const changeStream = mongoose.connection.db.watch([], {
      fullDocument: "updateLookup",
    });

    console.log(`🔍 Watching all collections in DB "${sourceDbName}"...`);

    changeStream.on("change", async (change) => {
        //@ts-expect-error error
      const collectionName = change.ns.coll; // dynamic collection name
      if (!collectionName) return;

      const backupColl = backupDb.collection(collectionName); // backup to same-named collection
          //@ts-ignore
      const backupDoc = change.fullDocument

       backupColl.insertOne(backupDoc).then(()=>{
        console.log(`✅ Change in "${collectionName}" backed up to backupdb`);
       }).catch((err:any)=>{
        console.error("❌ Change Stream error:", err);
       })
    });



  } catch (error) {
    console.error("❌ Error in realTimeBackup:", error);
  }
};


