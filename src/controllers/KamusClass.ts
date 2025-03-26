import { goingModel, mainModel } from "@/models/post";
import { Model } from "mongoose";
import kaganga from "./kaganga";
import dbConnect from "@/utils/mongoose";
import dotenv from "dotenv";

await dbConnect();

dotenv.config();

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
    let result: string = input;

    if (rejang) {
      const doc = await this.data.findOne({ Rejang: input });
      if (doc) {
        result = doc.Indonesia;
        aksaraKaganga = kaganga(result);
      }
    } else {
      input = input.replace("ê", "e");
      const doc = await this.data.findOne({ Indonesia: input });
      if (doc) {
        result = doc.Rejang.replace("ê", "e");
      }
    }
    aksaraKaganga = kaganga(result);

    return {
      result: result,
      aksara: aksaraKaganga,
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
  async post(Indonesia: string, Rejang: string) {
    const badWordsString: any = process.env.katakasar;
    const badword = badWordsString.split(",");
    Indonesia = Indonesia.toLowerCase();
    Rejang = Rejang.toLowerCase();
    try {
      // Validasi kata kasar
      const containsBadWord = badword.some((word: string) => {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(Indonesia) || regex.test(Rejang);
      });

      if (Indonesia.trim() !== "" && Rejang.trim() !== "" && !containsBadWord) {
        // TODO: Tambahkan posting ke database terlebih dahulu.
        const existingDataIndo = await this.data.findOne({ Indonesia });
        const existingDataRejang = await this.data.findOne({ Rejang });

        if (!existingDataIndo && !existingDataRejang) {
          // Data belum ada dalam database, tambahkan ke database
          await this.ongoingdata.create({ Indonesia, Rejang });
        } else {
          console.log("Data already exists in the database.");
        }
      } else {
        return 204;
      }
      return 200;
    } catch (err) {
      console.error(err);
    }
  }

  async edit(id: string | null, Indonesia: string, Rejang: string) {
    try {
      const badWordsString: string | undefined = process.env.katakasar;
      if (!badWordsString)
        throw new Error("Bad words list is missing in environment variables.");

      const badWords = badWordsString.split(",");
      Indonesia = Indonesia.toLowerCase().trim();
      Rejang = Rejang.toLowerCase().trim();

      // Validate bad words
      const containsBadWord = badWords.some((word: string) => {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(Indonesia) || regex.test(Rejang);
      });

      if (!Indonesia || !Rejang || containsBadWord) {
        return 204; // No content - Invalid input or bad word detected
      }

      // Check if data already exists in the main `data` or `ongoingdata`
      const [existingMainData, existingOngoingData] = await Promise.all([
        this.data.findOne({ Indonesia, Rejang }),
        this.ongoingdata.findOne({ Indonesia, Rejang }),
      ]);

      if (!existingMainData && !existingOngoingData) {
        if (id) {
          // Editing existing ongoing data
          const updatedOngoing = await this.ongoingdata.findByIdAndUpdate(
            id,
            { Indonesia, Rejang },
            { new: true } // Return the updated document
          );
          if (updatedOngoing) {
            console.log("Ongoing data has been updated.");
            return 200; // Success
          } else {
            console.log("Data not found in ongoingdata for editing.");
            return 404; // Not Found
          }
        } else {
          // Adding new data to `ongoingdata`
          await this.ongoingdata.create({ Indonesia, Rejang });
          console.log("New data has been added to ongoingdata.");
          return 200; // Success
        }
      } else {
        console.log("Data already exists in the main database or ongoingdata.");
        return 409; // Conflict - Data already exists
      }
    } catch (err) {
      console.error(
        "An error occurred while editing or adding to ongoingdata:",
        err
      );
      return 500; // Internal Server Error
    }
  }

  async accept(id: string) {
    try {
      // Find the entry in ongoingdata by its ID
      const entry = await this.ongoingdata.findById(id);

      if (entry) {
        // Add the entry to the main collection (data)
        await this.data.create({
          Indonesia: entry.Indonesia,
          Rejang: entry.Rejang,
        });

        // Remove the entry from ongoingdata
        await this.ongoingdata.findByIdAndDelete(id);

        console.log("Data has been accepted and moved to the main collection.");
        return 200; // Success
      } else {
        console.log("Entry not found in ongoingdata.");
        return 404; // Not Found
      }
    } catch (err) {
      console.error("An error occurred while accepting data:", err);
      return 500; // Internal Server Error
    }
  }
}

export default KamusClass;
