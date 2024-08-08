"use server";

import prisma from "@/lib/prisma";
import { privyServer } from "@/lib/privyServer";

export async function submitPost(content: string, token: string) {
  if (!token) {
    throw new Error("Unauthorized: No authentication token provided");
  }

  try {
    const verifiedClaims = await privyServer.verifyAuthToken(token);
    
    // Find the user based on the privyUserId
    const user = await prisma.user.findUnique({
      where: { privyUserId: verifiedClaims.userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await prisma.project.create({
      data: {
        content,
        userId: user.id, // Use the internal id, not the privyUserId
      },
    });

    return result;
  } catch (error) {
    console.error("Error submitting post:", error);
    throw new Error("Failed to submit post");
  }
}