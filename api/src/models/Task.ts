import { Schema, model, type Document, type Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  taskNumber: string;
  description?: string;
  status: string;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    taskNumber: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "pending"],
      default: "open",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.pre("save", async function () {
  if (this.isNew || this.taskNumber) return;

  this.taskNumber = `TSK-${Math.floor(Math.random() * 1000)}`;
});

export const Task = model<ITask>("Task", taskSchema);
