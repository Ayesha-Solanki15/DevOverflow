import { z } from "zod";

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3)
})
// Even if we don't provide any error msg in the schema, the zodResolver will automatically generate the default error message for us.

