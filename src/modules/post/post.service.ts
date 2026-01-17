import { Post, PostStatus } from "../../../generated/prisma/client";

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
    tags: string[] | [],
    isFeatured: boolean | undefined
    status: PostStatus | undefined
    authorId: string | undefined
    page: number,
    limit: number
    skip: number,
    sortBy: string,
    sortOrder: string


}) => {
    const andCondition: PostWhereInput[] = []

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

    if (typeof (payload.isFeatured) === 'boolean') {
        andCondition.push({
            isFeatured: payload.isFeatured
        })
    }

    if (payload.status) {
        andCondition.push({
            status: payload.status
        })
    }

    if (payload.authorId) {
        andCondition.push({
            authorId: payload.authorId
        })
    }

    const allPosts = await prisma.post.findMany({
        take: payload.limit,
        skip: payload.skip,
        where: {
            AND: andCondition
        },
        orderBy: {
            [payload.sortBy]: payload.sortOrder
        }
    })

    const total = await prisma.post.count({
        where: {
            AND: andCondition
        }
    })

    return {
        data: allPosts,
        pagination: {
            total,
            page: payload.page,
            limit: payload.limit,
            totalPage: Math.ceil(total / payload.limit)

        }
    }



}

const getPostById = async (postId: string) => {
    // console.log("get post by ID",postId)

    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        const postData = await tx.post.findUnique({
            where: {
                id: postId
            }
        })
        return postData
    })

    return result
}

export const postService = {
    createPost,
    getAllPost,
    getPostById
}