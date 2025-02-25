import { z, ZodSchema } from "zod";

export const validateData = <T>(
  schema: ZodSchema<T>, // <T> checks all generic zodschema types
  data: any
): string[] | null => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.format() as Record<string, any>;
    const errorsArr = [];
    for (const key in errors) {
      if (key === "_errors") continue;
      if (errors[key]?._errors) {
        errorsArr.push(errors[key]?._errors?.join(" | "));
      }
    }
    return errorsArr;
  }
  return null;
};
