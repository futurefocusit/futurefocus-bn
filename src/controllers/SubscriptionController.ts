import { Request, Response } from "express";
import { Access } from "../models/Access";
import { AccessPayment } from "../models/accessPayment";
import { Institution } from "../models/institution";
import { AccessTransaction } from "../models/accessTransaction";
import { sendEmail } from "../utils/sendEmail";
import { SubscriptionExpiryEmail } from "../utils/emailTemplate";
import { ObjectId } from "mongoose";

export class SubscriptionController {
    static renewSubscription = async (req: Request, res: Response) => {
        try {
            const { id, amount, months, features } = req.body;

            // Check if institution exists
            const institution = await Institution.findById(id);
            if (!institution) {
                return res.status(404).json({ message: "Institution not found" });
            }

            // Get current access
            const access = await Access.findOne({ institution: id });
            if (!access) {
                return res.status(404).json({ message: "No access record found" });
            }

            // Create access transaction
            const transaction = await AccessTransaction.create({
                institution: id,
                amount,
                type: "renewal",
                status: "pending",
                features: features.map((feature: ObjectId) => ({
                    feature,
                    months
                })),
            });

            // Calculate new subscription end date
            const currentEnd = access.subscriptionEnd || new Date();
            const newEnd = currentEnd ? new Date(currentEnd) : new Date();
            newEnd.setMonth(newEnd.getMonth() + months);

            // Update access record
            access.subscriptionEnd = newEnd;
            access.status = "active";
            access.gracePeriodEnd = undefined;

            // Update feature access
            if (features && features.length > 0) {
                features.forEach((feature: ObjectId) => {
                    const existingFeature = access.features.find(f => f.feature.toString() === feature.toString());
                    if (existingFeature) {
                        existingFeature.active = true;
                        // Use the feature's current expiresAt date as the base for renewal
                        const currentExpiresAt = existingFeature.expiresAt || new Date();
                        existingFeature.expiresAt = new Date(currentExpiresAt);
                        existingFeature.expiresAt.setMonth(existingFeature.expiresAt.getMonth() + months);
                        existingFeature.lastUpdated = new Date();
                    } else {
                        // For new features, set expiration based on current date
                        access.features.push({
                            feature: feature,
                            active: true,
                            expiresAt: new Date(new Date().setMonth(new Date().getMonth() + months)),
                            lastUpdated: new Date()
                        });
                    }
                });
            }

            // Save access record
            await access.save();

            // Create access payment record
            await AccessPayment.create({
                institution: id,
                amount
            });

            // Update transaction status
            transaction.status = "completed";
            await transaction.save();

            res.status(200).json({
                message: "Subscription renewed successfully",
                transactionId: transaction._id
            });
        } catch (error: any) {
            res.status(500).json({ message: `Error: ${error.message}` });
        }
    }

    static monitorSubscriptions = async () => {
        try {
            const now = new Date();
            const gracePeriodDays = 7;
            const gracePeriodEnd = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

            // Find subscriptions expiring in next 7 days
            const expiringSoon = await Access.find({
                subscriptionEnd: {
                    $gte: now,
                    $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                },
                status: "active"
            }).populate('institution');

            // Find expired subscriptions that need grace period
            const expired = await Access.find({
                subscriptionEnd: { $lt: now },
                status: "active"
            }).populate('institution');

            // Update expired subscriptions
            for (const access of expired) {
                access.status = "grace_period";
                access.gracePeriodEnd = gracePeriodEnd;
                await access.save();

                // Create transaction record for grace period
                await AccessTransaction.create({
                    //@ts-ignore
                    institution: access.institution._id,
                    amount: 0,
                    type: "subscription",
                    status: "completed",
                    paymentMethod: "grace_period",
                    subscriptionEnd: gracePeriodEnd
                });

                await sendEmail({
                    //@ts-ignore
                    to: access.institution.email,
                    subject: "Subscription Expired - Grace Period Started",
                    //@ts-ignore
                    html: SubscriptionExpiryEmail(access.institution.name, gracePeriodDays)
                });
            }

            // Find grace periods that have ended
            const endedGracePeriods = await Access.find({
                gracePeriodEnd: { $lt: now },
                status: "grace_period"
            }).populate('institution');

            // Update ended grace periods
            for (const access of endedGracePeriods) {
                access.status = "expired";
                access.features.forEach(feature => {
                    feature.active = false;
                });
                await access.save();

                // Create transaction record for expiration
                await AccessTransaction.create({
                    //@ts-ignore
                    institution: access.institution._id,
                    amount: 0,
                    type: "subscription",
                    status: "completed",
                    paymentMethod: "expired",
                    subscriptionEnd: now
                });

                await sendEmail({
                    //@ts-ignore
                    to: access.institution.email,
                    subject: "Grace Period Ended - Subscription Expired",
                    //@ts-ignore
                    html: SubscriptionExpiryEmail(access.institution.name, 0)
                });
            }

            return {
                expiringSoon,
                expired,
                endedGracePeriods
            };
        } catch (error) {
            console.error('Error monitoring subscriptions:', error);
        }
    }

    static getSubscriptionStatus = async (req: Request, res: Response) => {
        try {
            const { institutionId } = req.params;
            const access = await Access.findOne({ institution: institutionId })
                .populate('features.feature');

            if (!access) {
                return res.status(404).json({ message: "No subscription found" });
            }

            const now = new Date();
            const status = {
                isActive: access.status === "active",
                isExpired: access.status === "expired",
                isGracePeriod: access.status === "grace_period",
                daysUntilExpiry: Math.ceil((access.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                gracePeriodEnd: access.gracePeriodEnd,
                daysInGracePeriod: access.gracePeriodEnd ?
                    Math.ceil((access.gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) :
                    null,
                features: access.features.map(feature => ({
                    //@ts-ignore
                    id: feature.feature._id,
                    //@ts-ignore
                    name: feature.feature.name,
                    active: feature.active,
                    expiresAt: feature.expiresAt
                }))
            };

            res.status(200).json(status);
        } catch (error: any) {
            res.status(500).json({ message: `Error: ${error.message}` });
        }
    }
} 