import express, { Response } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController";
import { isloggedIn } from "../middleware/isLoggedIn";

const subscriptionRouter = express.Router();

// Renew subscription
subscriptionRouter.put("/renew", isloggedIn, SubscriptionController.renewSubscription);

// Get subscription status
subscriptionRouter.get("/status/:institutionId", isloggedIn, SubscriptionController.getSubscriptionStatus);

// Monitor subscriptions (admin only)
subscriptionRouter.get("/monitor", isloggedIn, async (req:any, res:Response) => {
  if (!req.loggedUser.isSuperAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  const result = await SubscriptionController.monitorSubscriptions();
  res.status(200).json(result);
});

export default subscriptionRouter; 