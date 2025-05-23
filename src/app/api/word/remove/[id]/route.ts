import KamusClass from "@/controllers/KamusClass";
import Users from "@/controllers/UserClass";
import { NextRequest, NextResponse } from "next/server";

const dataInstance = KamusClass.getInstance();
const userInstance = Users.getInstances();

export async function DELETE(req: NextRequest) {
  const user = await userInstance.authRequest(req);
  if (!user)
    return NextResponse.json({ msg: "Invalid Authentication." }, { status: 401 });

  const isRecruiterAdmin = await userInstance.checkAdmin(user._id || "");
  if (isRecruiterAdmin) {
    const id = req.nextUrl.pathname.split("/").pop(); // Extracting the ID correctly

    // Cek apakah ada query ?ongoing=true
    const isOngoing = req.nextUrl.searchParams.get("ongoing") === "true";

    // Panggil fungsi delete dengan parameter true/false sesuai query
    await dataInstance.delete(id || "", isOngoing);
    return NextResponse.json({ msg: "Post deleted successfully." }); // Return setelah berhasil delete
  }

  return NextResponse.json({ msg: "Unauthorized action." }, { status: 403 }); // Handle non-admin cases
}
