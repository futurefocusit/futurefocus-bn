import mongoose, { model, Schema } from "mongoose";

export interface AccessTransactionTypes {
    institution: mongoose.Types.ObjectId;
    amount: number;
    type: "subscription" | "renewal" | "upgrade" | "feature_add";
    status: "pending" | "completed" | "failed";
    paymentMethod: string;
    features?: {
        feature: mongoose.Types.ObjectId;
        months: number;
    }[];
    subscriptionEnd?: Date;
    reference?: string;
}

const AccessTransactionSchema = new Schema<AccessTransactionTypes>({
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Institution",
    },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ["subscription", "renewal", "upgrade", "feature_add"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    paymentMethod: { type: String },
    features: [{
        feature: {
            type: mongoose.Types.ObjectId,
            ref: "Feature",
            required: true,
        },
        months: { type: Number, required: true },
    }],
    subscriptionEnd: { type: Date },
    reference: { type: String },
}, { timestamps: true });

export const AccessTransaction = model<AccessTransactionTypes>("AccessTransaction", AccessTransactionSchema);