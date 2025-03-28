import KamusClass from "@/controllers/KamusClass";
import Users from "@/controllers/UserClass";
import { NextRequest, NextResponse } from "next/server";

const dataInstance = KamusClass.getInstance();
const userInstance = Users.getInstances();

export async function POST(req: NextRequest) {
  const user = await userInstance.authRequest(req);
  if (!user)
    return NextResponse.json({ msg: "Invalid Authentication." }, { status: 401 });

  const isRecruiterAdmin = await userInstance.checkAdmin(user._id || "");
  if (isRecruiterAdmin) {
    const id = req.nextUrl.pathname.split("/").pop(); // Extracting the ID correctly
    await dataInstance.accept(id || "");
    return NextResponse.json({ msg: "Post deleted successfully." }); // Return after successful deletion
  }

  return NextResponse.json({ msg: "Unauthorized action." }, { status: 403 }); // Handle non-admin cases
}