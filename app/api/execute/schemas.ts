import { z } from "zod";

const toolCallSchema = z.object({
  name: z.string({
    required_error: "toolCall.name is required",
    invalid_type_error: "toolCall.name must be a string",
  }),
  args: z.record(z.unknown()).optional(),
});
export const routeBodySchema = z.object({
  toolCall: toolCallSchema.refine((data) => data.name.trim().length > 0, {
    message: "toolCall.name cannot be an empty string",
  }),
  didToken: z
    .string({
      required_error: "didToken is required",
      invalid_type_error: "didToken must be a string",
    })
    .min(1, "didToken cannot be an empty string"),
  pin: z
    .string({
      required_error: "pin is required",
      invalid_type_error: "pin must be a string",
    })
    .min(1, "pin cannot be an empty string"),
});
