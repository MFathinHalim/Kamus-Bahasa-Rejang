import kaganga from "@/controllers/kaganga";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {  
    const searchParams = req.nextUrl.searchParams;    // Access query parameters on the server
  
    const prompt = searchParams.get("word") || "";
    const data = await kaganga(prompt);

    if (!data) return NextResponse.json({ msg: "data not found!" }, { status: 404 })

    return NextResponse.json(data)
}
