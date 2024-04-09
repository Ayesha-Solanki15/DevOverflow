import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";
import React from "react";

const Page = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const mongoUser = await getUserById({ userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
        {/* we are passing the objects here a mongoUser as a JSON string and then parsing it because only plain objects can be passed to client components from server components. Objects with toJSON methods are not supported. So we have to manually convert them */}
      </div>
    </>
  );
};

export default Page;
