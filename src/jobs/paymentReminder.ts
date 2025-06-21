import cron from "node-cron";
import { Access } from "../models/Access";
import reminder from "../models/notficication";
import Team from "../models/Team";
import moment from "moment";
import { Types } from "mongoose";
import { InstitutionTypes } from "../types/Types";

export const subscriptionReminder = () => cron.schedule("0 9 * * *", async () => {
    try {
        const today = moment().startOf('day');
        const fiveDaysFromNow = moment().add(5, 'days').endOf('day');

        const upcomingSubscriptions = await Access.find({
            subscriptionEnd: {
                $gte: today.toDate(),
                $lte: fiveDaysFromNow.toDate(),
            },
            status: "active",
        }).populate('institution');

        for (const subscription of upcomingSubscriptions) {
            if (subscription.institution instanceof Types.ObjectId) {
                continue; 
            }
            const institution = subscription.institution as InstitutionTypes;

            const admins = await Team.find({
                institution: institution,
                $or: [{ isAdmin: true }, { isSuperAdmin: true }],
            });

            if (admins.length > 0) {
                const dueDate = moment(subscription.subscriptionEnd);
                const remainingDays = dueDate.diff(today, 'days');

                // Create a reminder for each admin of the institution
                for (const admin of admins) {
                    await reminder.create({
                        user: admin._id,
                        employeeName: institution.name,
                        sentDate: today.format('YYYY-MM-DD'),
                        dueDate: dueDate.format('YYYY-MM-DD'),
                        remainingDays: remainingDays,
                        status: "Pending",
                        isPaid: false
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error in subscriptionReminder job:", error);
    }
}); 