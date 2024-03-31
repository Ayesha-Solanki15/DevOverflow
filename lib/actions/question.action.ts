"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import { CreateQuestionsParams, GetQuestionsParams } from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    // why populate? MongoDB doesn't store the the tags itself but it stores the reference to those tags so we are populating the tag values
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({createdAt: -1})

    // .sort is to get the newly added question at the top

    return { questions };
  } catch (error) {
    console.log(error);
    throw error
  }
}

export async function createQuestion(params: CreateQuestionsParams) {
  try {
    // connect to the database
    connectToDatabase();
    const { title, content, tags, author, path } = params;
    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exists
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { upsert: true, new: true }
      );
      tagDocuments.push(existingTag._id);
    }

    // Update the question with the tags
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });



    // create an interaction record for the user's ask_question action

    // Increment author's reputation by +5 for creating a question

    // this revalidate path is of utmost significance because once we create a question, our code redirect us to home page and there we must see the newly created question post, and it could be done by either manually refreshing the page or by the below function.
    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}
