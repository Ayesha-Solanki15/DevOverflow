"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();
    // eslint-disable-next-line no-unused-vars
    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Find interaction for the user and group by tags...
    // TODO: make interaction model

    return [
      { _id: "1", name: "express" },
      { _id: "2", name: "server" },
      { _id: "3", name: "sql" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getAllTags(params : GetAllTagsParams) {
  try {
    connectToDatabase()

    const tags = await Tag.find({})

    return {tags}

  } catch(error) {
    console.log(error)
    throw error
  }
}
