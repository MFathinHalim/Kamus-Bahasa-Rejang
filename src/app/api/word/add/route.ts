import KamusClass from "@/controllers/KamusClass";
import Users from "@/controllers/UserClass";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const dataInstance = KamusClass.getInstance();
const userInstance = Users.getInstances();

export async function POST(req: NextRequest) {
  try {
    // Extract and parse form data from the request
    const formData = await req.formData();
    const Indonesia = formData.get("Indonesia")?.toString() || "";
    const Rejang = formData.get("Rejang")?.toString() || "";

    if (!Indonesia || !Rejang) {
      return NextResponse.json({ error: "Indonesia and Rejang fields are required." }, { status: 400 });
    }

    // Extract Authorization header and check token
    const headersList: any = headers();
    const authHeader = headersList.get("authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer token format
    
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 401 });
    }

    const checkToken = await userInstance.checkAccessToken(token);
    if (!checkToken) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    // Create the new entry in the database (dataInstance.create handles insertion)
    const post = await dataInstance.post(Indonesia, Rejang);

    return NextResponse.json({ message: "Data successfully added!", post }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/add:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
