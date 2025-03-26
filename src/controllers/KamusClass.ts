import { goingModel, mainModel } from "@/models/post";
import { Model } from "mongoose";
import kaganga from "./kaganga";

class KamusClass {
  static instance: KamusClass;

  data: Model<Data>;
  ongoingdata: Model<Data>;
  constructor() {
    this.data = mainModel;
    this.ongoingdata = goingModel;
  }

  static getInstance(): KamusClass {
    if (!KamusClass.instance) KamusClass.instance = new KamusClass(); //bikin instance baru
    return KamusClass.instance;
  }

  async translate(input: string, rejang: boolean = false) {
    let aksaraKaganga: string = "";
    let result: string = "";

    if (rejang) {
      const doc = await this.data.findOne({ Rejang: input });
      if (doc) {
        result = doc.Rejang.replace("ê", "e");
        aksaraKaganga = kaganga(result);
      }
    } else {
      input = input.replace("ê", "e");
      const doc = await this.data.findOne({ Indonesia: input });
      if (doc) {
        result = doc.Indonesia;
        aksaraKaganga = kaganga(result);
      }
    }

    return {
      result: result || "Translation not found",
      aksara: aksaraKaganga || "Aksara translation not available",
    };
  }
  async postList(
    page: number = 1,
    limit: number = 10,
    ongoing: boolean = false
  ) {
    // 1. Mencari di data lokal (menggunakan skip dan limit untuk pagination)
    const skip = (page - 1) * limit;
    let localDataResults = [];
    if (ongoing) {
      localDataResults = await this.ongoingdata
        .find({})
        .skip(skip) // Skip untuk pagination
        .limit(limit) // Batas hasil berdasarkan limit
        .exec();
    } else {
      localDataResults = await this.data
        .find({})
        .skip(skip) // Skip untuk pagination
        .limit(limit) // Batas hasil berdasarkan limit
        .exec();
    }

    return localDataResults;
  }
  async delete(id: string | string[], ongoing: boolean) {
    if (ongoing) {
      await this.ongoingdata.deleteOne({ _id: id });
    } else {
      await this.data.deleteOne({ _id: id });
    }
  }
}
