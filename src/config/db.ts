import mongoose from "mongoose"; 
  
const  connection = async () => {    
  try { 
    await mongoose.connect(process.env.MONGODB_URI as string,{
      serverSelectionTimeoutMS: 30000,
      dbName:"xcool" 
      
    });
    console.log("database connected successfully");
  } catch (error) { 
    console.log("Failed to connect", error);
  }
};

export default connection;
