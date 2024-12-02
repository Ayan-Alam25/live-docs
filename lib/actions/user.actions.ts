'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    if (!userIds || userIds.length === 0) {
      console.error("userIds is empty or undefined.");
      return [];
    }

    const { data = [] } = await clerkClient.users.getUserList({
      emailAddresses: userIds, // Correct key
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`,
      email: user.emailAddresses?.[0]?.emailAddress || "",
      avatar: user.imageUrl || "",
    }));

    const sortedUsers = userIds.map(
      (email) => users.find((user) => user.email === email) || null
    );

    return parseStringify(sortedUsers);
  } catch (error) {
    console.error(`Error fetching users: ${error}`);
    return [];
  }
};

export const getDocumentUsers = async ({ roomId, currentUser, text }: { roomId: string, currentUser: string, text: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);

    if(text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) => email.toLowerCase().includes(lowerCaseText))

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
}