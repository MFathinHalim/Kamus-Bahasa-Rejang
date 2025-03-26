import { Model, Schema, model, models } from "mongoose";

const mainSchema = new Schema({
    Indonesia: String,
    Rejang: String
})

const mainModel: Model<Data> = models.mains || model<Data>("mains", mainSchema);
const goingModel: Model<Data> = models.ongoings || model<Data>("ongoings", mainSchema);

export { mainModel, goingModel };