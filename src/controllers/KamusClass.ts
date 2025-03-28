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
  async translateWithGoogle(input: string, targetLang = "id") {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          input
        )}`
      );

      const result = await response.json();
      return result[0][0][0]; // Mengambil teks hasil terjemahan
    } catch (error) {
      console.error("Translation failed:", error);
      return "Terjemahan gagal.";
    }
  }
  async translate(input: string | any, rejang: boolean = false) {
    let aksaraKaganga: string = "";
    let result: string = input;

    input = await this.translateWithGoogle(input); // Output: "Halo Dunia"

    // Tambahkan spasi dan ganti "ku" dengan " saya"
    input = input.replace(/ku\b/g, " saya");
    const words = input.toLowerCase().split(" ");

    if (rejang) {
      // Translate each Rejang word to Indonesia
      const translations = await Promise.all(
        words.map(async (word: string) => {
          const doc = await this.data.findOne({ Rejang: word });
          return doc ? doc.Indonesia : word; // Replace if found, otherwise keep the original word
        })
      );
      result = translations.join(" "); // Reconstruct the translated sentence
      aksaraKaganga = kaganga(result);
    } else {
      // Handle Indonesia to Rejang translation with "ê" normalization
      const normalizedWords = words.map((word: string) => word.replace("ê", "e"));

      const translations = await Promise.all(
        normalizedWords.map(async (word: string) => {
          const doc = await this.data.findOne({ Indonesia: word });
          return doc ? doc.Rejang.replace("ê", "e") : word; // Replace if found, else keep original
        })
      );
      result = translations.join(" "); // Reconstruct the translated sentence
    }

    aksaraKaganga = kaganga(result);

    return {
      result: result, // Final translated result (sentence)
      aksara: aksaraKaganga, // Result converted to aksara Kaganga
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
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        return regex.test(Indonesia) || regex.test(Rejang);
      });

      if (!Indonesia || !Rejang || containsBadWord) {
        console.log("Invalid input or bad word detected.");
        return 204; // No Content - Bad word or empty input
      }

      // Cek apakah data ada di main `data` atau `ongoingdata`
      const existingOngoingData = await this.ongoingdata.findById(id);


      // Jika ID ditemukan, edit data di ongoingdata
      if (existingOngoingData) {
        const updatedOngoing = await this.ongoingdata.findByIdAndUpdate(
          id,
          { Indonesia, Rejang },
          { new: true } // Mengembalikan dokumen yang diperbarui
        );
        console.log("Ongoing data has been updated.");
        return updatedOngoing ? 200 : 404; // Return 200 jika sukses, 404 jika tidak ditemukan
      }

      // Jika ID tidak ada, tambahkan sebagai data baru ke ongoingdata
      await this.ongoingdata.create({ _id: id, Indonesia, Rejang });
      console.log("New data has been added to ongoingdata.");
      return 201; // Created
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
      if (!entry) {
        console.log("Entry not found in ongoingdata.");
        return 404; // Not Found
      }

      // Check if the entry already exists in the main collection
      const existingEntry = await this.data.findById(id);

      if (existingEntry) {
        // If the entry exists, update it
        await this.data.findByIdAndUpdate(existingEntry._id, {
          Indonesia: entry.Indonesia,
          Rejang: entry.Rejang,
        });
        console.log("Existing data in the main collection has been updated.");
      } else {
        // If the entry does not exist, create a new entry in the main collection
        await this.data.create({
          Indonesia: entry.Indonesia,
          Rejang: entry.Rejang,
        });
        console.log("New data has been added to the main collection.");
      }

      // Remove the entry from ongoingdata
      await this.ongoingdata.findByIdAndDelete(id);
      console.log(
        "Data has been accepted and moved/dealt with in the main collection."
      );

      return 200; // Success
    } catch (err) {
      console.error("An error occurred while accepting data:", err);
      return 500; // Internal Server Error
    }
  }
}

export default KamusClass;
