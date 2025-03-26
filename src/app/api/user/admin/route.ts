import Users from "@/controllers/UserClass";
import { NextRequest, NextResponse } from "next/server";

const userInstance = Users.getInstances();

export async function POST(req: NextRequest) {
    const user = await userInstance.authRequest(req);
    if (!user) return NextResponse.json({ msg: "Invalid Authentication." }, { status: 401 });
    const isRecruiterAdmin = await userInstance.checkAdmin(user.id || "");
    if(isRecruiterAdmin) {
        const id = req.nextUrl.pathname.split("/");
        userInstance.recrutAdmin(id)
        return NextResponse.json(user);
    } else {
        return
    }
}