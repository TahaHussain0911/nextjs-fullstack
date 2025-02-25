import { validateData } from "@/helpers/validateZod";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { verifySchema } from "@/schemas/verify.schema";

export async function POST(request: Request) {
  await connectDB();
  try {
    const { username, code } = await request.json();
    const errors = validateData(verifySchema, { code, username });
    if (errors) {
      return Response.json(
        {
          success: false,
          message: errors,
        },
        {
          status: 400,
        }
      );
    }
    const userExists = await UserModel.findOne({ username });
    if (!userExists) {
      return Response.json(
        {
          success: false,
          message: "User with this username not exists",
        },
        {
          status: 400,
        }
      );
    }
    if (userExists?.isVerified) {
      return Response.json(
        {
          success: false,
          message: "User with this email is already verified",
        },
        {
          status: 400,
        }
      );
    }
    const correctCode = userExists?.verifyCode === code;
    const codeExpiry = new Date(userExists?.verifyCodeExpiry) < new Date();
    if (codeExpiry) {
      return Response.json(
        {
          success: false,
          message: "Verify code expired. Please signup again to get code.",
        },
        { status: 400 }
      );
    } else if (!correctCode) {
      return Response.json(
        {
          success: false,
          message: "Invalid verification code.",
        },
        { status: 400 }
      );
    }
    userExists.isVerified = true;
    await userExists.save();
    return Response.json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error) {
    console.log("Error verifying code", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    );
  }
}
