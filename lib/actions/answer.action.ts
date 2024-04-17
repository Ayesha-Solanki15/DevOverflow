"use server";

import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "@/lib/actions/shared.types";
import { connectToDatabase } from "@/lib/mongoose";
import Question from "../../database/question.model";
import Answer from "../../database/answer.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";
import { User } from "../../database/user.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();
    const { content, author, question, path } = params;
    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // Add the answer to the question's answers array
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // Adding interaction 
    await Interaction.create({
      user: author,
      action: "answer",
      question,
      answer: newAnswer._id,
      tags: questionObject.tags
    });
    // increment author's reputation for answering a question
    await User.findByIdAndUpdate(author, {
      $inc: { reputation: 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const isNext = totalAnswers > skipAmount + answers.length;

    return { answers, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params;

    let updateQuery = {};

    // if the user has already upvoted the question, remove the upvote when the user clicks the upvote button again and if the user has downvoted the question, remove the downvote and add the upvote when the user clicks the upvote button again and if the user has not voted the question, add the upvote when the user clicks the upvote button for the first time
    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation  for upvoting/revoking an upvote to another answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasUpvoted ? -2 : 2 },
    });
    
    // Increment author's reputation  for receiving an upvote for an answer
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasUpvoted ? -10 : 10 },
    })

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params;

    let updateQuery = {};

    // if the user has already downvoted the question, remove the downvote when the user clicks the downvote button again and if the user has upvoted the question, remove the upvote and add the downvote when the user clicks the downvote button again and if the user has not voted the question, add the downvote when the user clicks the downvote button for the first time
    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation  for downvoting/revoking a downvote to another answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasDownvoted ? -2 : 2 },
    });
    
    // Increment author's reputation  for receiving a downvote for an answer
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasDownvoted? -10 : 10 },
    })

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();
    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    await answer.deleteOne({ _id: answerId });

    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );

    await Interaction.deleteMany({
      answer: answerId,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
