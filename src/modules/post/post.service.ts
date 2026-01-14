import { Post } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result
}

const getAllPost = async (payload: {
    search: string | undefined,
    tags: string[] | []

}) => {
    const andCondition:PostWhereInput[] = []

    if (payload.search) {
        andCondition.push(
            {
                OR: [
                    {
                        title: {
                            contains: payload.search,
                            mode: "insensitive"
                        }
                    },
                    {
                        content: {
                            contains: payload.search,
                            mode: "insensitive"
                        }
                    },
                    {
                        tags: {
                            has: payload.search,

                        }
                    }
                ]
            }
        )
    }

    if (payload.tags.length > 0) {
        andCondition.push(
            {
                tags: {
                    hasEvery: payload.tags as string[]
                }
            }
        )
    }
    const allPosts = await prisma.post.findMany({
        where: {
            AND: andCondition
        }
    })
    return allPosts
}

export const postService = {
    createPost,
    getAllPost
}