import { NextFunction, Response } from "express";
import { Access } from "../models/Access";
import Feature from "../models/Feature";

export const hasAcces = async (req: any, res: Response, next: NextFunction, feature: string) => {
  try {
    const institution = req.loggedUser.institution
    if (!institution) {
      return res.status(401).json({ message: "Unauthorazied! Login to proceceed" });
    }


    const acces = await Access.findOne({ institution })
    //@ts-ignore
    if (!acces || !acces.active) {
      return res.status(401).json({ message: "you don't have access at all, please subscribe" });
    }
    const features = await Promise.all(acces.features.map(async (features) => {
      return Feature.findOne({ feature })
    }))
    const ff = features.find(f => f !== null)
    if (!ff) {
      return
    }
    //@ts-ignore
    const hasAcces = acces.features.find(f => f.feature === ff._id && f.active)
    if (!hasAcces) {
      return res.status(401).json({ message: `you dont'have access for this ${feature}  recharge for it` })
    }
    next()
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: `Error occurred: ${error.message}` });
  }
};