import KamusClass from "@/controllers/KamusClass";
import { NextRequest, NextResponse } from "next/server";

const dataInstance = KamusClass.getInstance()

export async function GET(req: NextRequest) {  
    const param = req.nextUrl.pathname.split("/")[4]
    const searchParams = req.nextUrl.searchParams;    // Access query parameters on the server
  
    const rejang = param === "rejang"
    console.log(param)
    const prompt = searchParams.get("word") || "";
    const lang = searchParams.get("lang") || "";
    const data = await dataInstance.translate(prompt, rejang, lang)

    if (!data) return NextResponse.json({ msg: "data not found!" }, { status: 404 })

    return NextResponse.json(data)
}
