import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";

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
        },
        include:{
            _count:{
                select:{comments:true}
            }
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
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED,  
                    },
                    orderBy:{createdAt:"desc"},
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy:{createdAt:"asc"},
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy:{createdAt:"asc"},
                                }
                            }
                        }
                    }
                },
                _count:{
                    select:{comments:true}
                }
            }
        })
        return postData
    })

    return result
}

const getMyPost=async(authorId:string)=>{
    // console.log("get My Post")

    const userInfo = await prisma.user.findUniqueOrThrow({
        where:{
            id:authorId,
            status:"ACTIVE"
        },
        select:{
            id:true
        }
    })

    const result = await prisma.post.findMany({
        where:{
            authorId
        },
        orderBy:{
            createdAt:"desc"
        },
        include:{
            _count:{
                select:{
                    comments:true
                }
            }
        }
    })

    // const total = await prisma.post.count({
    //     where:{
    //         authorId
    //     }
    // })

    //  const total = await prisma.post.aggregate({
    //    _count:{
    //         id:true
    //    },
    //    where:{
    //         authorId
    //     },
    // })

    return {
        result
    }
}

// user- Can update his own post. Can't update isFeatured 
// admin- Can update all post and also update isFeatured


const updatePost=async(postId:string,data:Partial<Post>,authorId:string,isAdmin:boolean)=>{
//  console.log(postId,data,authorId)

const postData = await prisma.post.findUniqueOrThrow({
    where:{
        id:postId
    },
    select:{
        id:true,
        authorId:true
    }
})

if(!isAdmin && (postData.authorId !== authorId)){
throw new Error ("You are not the owner/creator of the post")
}

if(!isAdmin){
  delete data.isFeatured
}

const result = await prisma.post.update({
    where:{
        id:postId // it same if use postData.id
    },
    data
})

// console.log(postData)
// console.log(postData.id,postId)
return result
}

const deletePost = async(postId:string,authorId:string,isAdmin:boolean)=>{
//    console.log(postId,authorId,isAdmin)

const postData = await prisma.post.findUniqueOrThrow({
    where:{
        id:postId
    },
    select:{
        id:true,
        authorId:true
    }
})

if(!isAdmin && (postData.authorId !== authorId)){
throw new Error ("You are not the owner/creator of the post")
}

const result = await prisma.post.delete({
    where:{
        id:postId
    }
}) 

return result
}

// const getStat=async()=>{
//     return await prisma.$transaction(async(tx)=>{
//     const totalPosts = await tx.post.count();

//     const publishedPosts = await tx.post.count({
//         where:{
//             status:PostStatus.PUBLISHED
//         }

//     })

//      const draftPosts = await tx.post.count({
//         where:{
//             status:PostStatus.DRAFT
//         }
//     })

//     const archivedPosts = await tx.post.count({
//         where:{
//             status:PostStatus.ARCHIVED
//         }
//     })
//      return {totalPosts,publishedPosts,draftPosts,archivedPosts}
//    })
// }


const getStat = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,publishedPosts,draftPosts,archivedPosts, totalComments,approvedComments] = 
      await Promise.all([
      tx.post.count(),
      tx.post.count({ where: { status: PostStatus.PUBLISHED },}),
      tx.post.count({where: { status: PostStatus.DRAFT },}),
      tx.post.count({where: { status: PostStatus.ARCHIVED },}),
      tx.comment.count(),
      tx.comment.count({where:{status: CommentStatus.APPROVED}})
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments
    };
  });
};



export const postService = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updatePost,
    deletePost,
    getStat
}