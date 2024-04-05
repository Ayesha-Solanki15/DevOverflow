import { z } from "zod";
// zod is a library that helps us to validate the data that we receive from the user. It is a schema definition library that allows us to define the shape of the data that we expect to receive from the user. It also provides us with a way to validate the data against the schema that we have defined.

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});
// Even if we don't provide any error msg in the schema, the zodResolver will automatically generate the default error message for us.

export const AnswerSchema = z.object({
  answer: z.string().min(100),
});
