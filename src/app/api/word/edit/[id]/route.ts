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
    const id = req.nextUrl.pathname.split("/").pop(); // Extracting the ID correctly
    const Indonesia = formData.get("Indonesia")?.toString() || "";
    const Rejang = formData.get("Rejang")?.toString() || "";

    if (!id || !Indonesia || !Rejang) {
      return NextResponse.json({ error: "ID, Indonesia, and Rejang fields are required." }, { status: 400 });
    }

    // Await the headers
    const headersList = await headers(); // Awaiting the headers() call

    const authHeader = headersList.get("authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from Bearer token format
    
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 401 });
    }

    const checkToken = await userInstance.checkAccessToken(token);
    if (!checkToken) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    // Update the existing entry in the database by ID
    const updatedPost = await dataInstance.edit(id, Indonesia, Rejang);

    if (!updatedPost) {
      return NextResponse.json({ error: "Data not found or could not be updated." }, { status: 404 });
    }

    return NextResponse.json({ message: "Data successfully updated!", updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/edit:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
