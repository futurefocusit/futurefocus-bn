import { Request, Response } from "express";
import { IMaterialRent, Inventory, Material, MaterialRent } from "../models/Materials";

export class inventoryControllers {
  static newCategory = async (req: any, res: Response) => {
    const data = req.body;
    const loggedUser  = req.loggedUser
    data.institution = loggedUser.institution
    try {
      await Inventory.create(data);
      res.status(200).json({ message: "suscesfuly added category" });

    } catch (error) {
      res.status(500).json({ message: "internal server error" });
    }
  };
  static newMaterial = async (req:any, res: Response) => {
    const data = req.body;
    const loggedUser  = req.loggedUser
    data.institution = loggedUser.institution

    try {
      await Material.create(data);
      res.status(200).json({ message: "suucesfuly added item" }); 

    } catch (error:any) {
      res.status(500).json({ message: `${error.message}` });
    }
  };
  static rentItems = async (req: any, res: Response) => {

    const items:IMaterialRent[] = req.body.items
    const { returnDate, cost, render, rendeeName } = req.body;  
const loggedUser = req.loggedUser
    try {
  for (const item of items) {
    await MaterialRent.create({
      materialId: item._id,
      amount: item.amount,
      returnDate: returnDate,
      rendeeName,
      render,
      institution:loggedUser.institution,
      cost,
    });
    await Material.findByIdAndUpdate(item._id, { $inc: { rent: item.amount } });
  }
  res.status(200).json({ message: "successfully rented item" });
} catch (error) {
  console.log(error);
  res.status(500).json({ message: "internal server error" });
}
  }
  static returnMaterial = async (req: any, res: Response) => {
    // const {receiver} = req.body;  
    const {id} = req.params;
    try {
    const material=  await MaterialRent.findByIdAndUpdate(id, {
        returnedDate: new Date(),
        returned: true,
        receiver:req.loggedUser._id,  
      });
      if(!material){
        return res.status(400).json({message:"no Rent found"})  
      }
  await Material.findByIdAndUpdate(material.materialId,{$inc: {rent: -material.amount }});
   

      res.status(200).json({ message: "suucesfuly returned item" });    

    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "internal server error" });
    }
  };
  static getAllInventory = async (req: any, res: Response) => {
    try {
const loggedUser = req.loggedUser
  
      const inventories = await Material.find({institution:loggedUser.institution,deleted:false}).populate('category')
      res.status(200).json(inventories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error)
    }
  };
  static getAllInventoryRent = async (req: any, res: Response) => {
    try {
       const loggedUser = req.loggedUser

      const rent = await MaterialRent.find({institution:loggedUser.institution,deleted:false}).populate('materialId').populate('render').populate('receiver')
      res.status(200).json(rent);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error)
    }
  };
  static getCategory = async (req: any, res: Response) => {
    try {
const loggedUser = req.loggedUser
      const inventories = await Inventory.find({institution:loggedUser.institution,deleted:false})
      res.status(200).json(inventories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error)
    }
  };

  static getInventoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const inventory = await Material.findById(id).populate('category');
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      res.status(200).json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static updateInventory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    try {
      const updatedInventory = await Material.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!updatedInventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      res.status(200).json(updatedInventory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static deleteInventory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedInventory = await Material.findByIdAndUpdate(id,{deleted:true});
      if (!deletedInventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      res.status(200).json({ message: "Inventory deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

