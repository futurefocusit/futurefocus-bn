import mongoose from "mongoose";
import connection from "./db";
import  { MongoClient } from "mongodb"
import dotenv from 'dotenv'
dotenv.config()
const sourceDbName = "ffa";
const backupDbName = "backupdb"; 

export const realTimeBackup = async () => {
  try {
    await connection(); 

    if (!mongoose.connection.db) {
      console.log("❌ Could not find source DB");
      return;
    }

    const backupClient = new MongoClient(process.env.MONGODB_URI_BACKUP as string);
    await backupClient.connect();
    console.log("✅ MongoClient connected to backupdb");

    const backupDb = backupClient.db(backupDbName);

    const changeStream = mongoose.connection.db.watch([], {
      fullDocument: "updateLookup",
    });

    console.log(`🔍 Watching all collections in DB "${sourceDbName}"...`);

    changeStream.on("change", async (change) => {
      //@ts-ignore
      const collectionName = change.ns.coll; 
      if (!collectionName) return;

      const backupColl = backupDb.collection(collectionName);

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


