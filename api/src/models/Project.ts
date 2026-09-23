import { Schema, model, type Document, type Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  projectNumber: string;
  status: string;
  projectType: string;
  owner: Types.ObjectId;
  startDate: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    projectNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "pending"],
      default: "open",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
      enum: ["core", "innovation", "research", "collaboration"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Project = model<IProject>("Project", projectSchema);
