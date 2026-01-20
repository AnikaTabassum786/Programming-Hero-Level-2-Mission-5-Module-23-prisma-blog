import { error } from "node:console"
import { prisma } from "../../lib/prisma"
import { CommentStatus } from "../../../generated/prisma/enums"


const createComment = async (payload:
    {
        content: string,
        authorId: string,
        postId: string,
        parentId?: string
    }

) => {
    // console.log("Create Comment Service!!",payload)

    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        const parentData = await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    const result = await prisma.comment.create({
        data: payload
    })

    return result
}

const getCommentById = async (commentId: string) => {
    // console.log("Get comment by id",commentId)

    const result = await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        // include:{
        //     post:true
        // }
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    tags: true,
                    views: true

                }
            }
        }
    })

    return result
}

const getCommentByAuthorId = async (authorId: string) => {

    const result = await prisma.comment.findMany({
        where: {
            authorId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
    return result
}

//1.nijer comment delete korte parbe
//2.login thakte hobe
//3.login user ar nijer comment kina ata check kortr hobe

const deleteComment = async (commentId: string, authorId: string) => {
    // console.log("Delete Comment",commentId,authorId)

    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })
    // console.log(commentData)
    if (!commentData) {
        throw new Error('Your provided input is invalid')
    }

    const result = await prisma.comment.delete({
        where: {
            id: commentId
        }
    })
    return result
}

//authorId- jar comment sai update korte parbe,
//commentId- kon comment update korbe
//update data- ki update korbe

const updateComment = async (authorId: string, commentId: string, data: { content?: string, status?: CommentStatus }) => {
    // console.log(authorId, commentId, data)
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })
    // console.log(commentData)
    if (!commentData) {
        throw new Error('Your provided input is invalid')
    }

    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data
    })

    return result
}

const moderateComment = async (commentId: string, info: { status: CommentStatus }) => {
    // console.log("Moderate Comment",commentId,data)

    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        }
    });

    // console.log(commentData.status) // from database
    // console.log(info.status)  // from client (Postman)
    
    if(commentData.status === info.status){
    throw new Error (`Your Provided (${info.status}) is already updated`)
    }


    const result = await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: info
    })
    return result
}


export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthorId,
    deleteComment,
    updateComment,
    moderateComment
}

