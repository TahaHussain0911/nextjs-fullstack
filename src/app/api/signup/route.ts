import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerification";
import { signUpSchema } from "@/schemas/signup.schema";
import { validateData } from "@/helpers/validateZod";

export async function POST(request: Request) {
  await connectDB();
  try {
    const { username, email, password } = await request.json();
    const errors = validateData(signUpSchema, { username, email, password });
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
    const userExistsAndVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (userExistsAndVerified) {
      return Response.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }
    const userEmailExists = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (userEmailExists) {
      if (userEmailExists?.isVerified) {
        return Response.json({
          success: false,
          message: "User already exists with this email",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      userEmailExists.password = hashedPassword;
      userEmailExists.verifyCode = verifyCode;
      userEmailExists.verifyCodeExpiry = new Date(Date.now() + 3600000);
      await userEmailExists.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    const emailRes = await sendVerificationEmail(email, username, verifyCode);
    if (!emailRes?.success) {
      return Response.json(
        {
          success: false,
          message: emailRes?.message,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered. Please verify otp send on your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error Registering User",
      },
      {
        status: 500,
      }
    );
  }
}
