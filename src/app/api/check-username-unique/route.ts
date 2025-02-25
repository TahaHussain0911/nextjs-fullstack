import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { userNameValidation } from "@/schemas/signup.schema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      username: searchParams.get("username"),
    };
    const result = UsernameQuerySchema.safeParse(query);
    if (!result?.success) {
      const errors = result.error.format()?.username?._errors || [];
      return Response.json(
        {
          status: false,
          message:
            errors?.length > 0 ? errors?.join(", ") : "Invalid Query Params",
        },
        {
          status: 400,
        }
      );
    }
    const existingUser = await UserModel.findOne({
      username: query?.username,
      isVerified: true,
    });
    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username unique!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
