import KamusClass from "@/controllers/KamusClass";
import { NextRequest, NextResponse } from "next/server";

const dataInstance = KamusClass.getInstance()

export async function GET(req: NextRequest) {  
    const param = req.nextUrl.pathname.split("/")[3]
    const searchParams = req.nextUrl.searchParams;    // Access query parameters on the server
  
    const rejang = param === "rejang";
    const prompt = searchParams.get("word") || "";
    const data = await dataInstance.translate(prompt, rejang)

    if (!data) return NextResponse.json({ msg: "data not found!" }, { status: 404 })

    return NextResponse.json(data)
}
