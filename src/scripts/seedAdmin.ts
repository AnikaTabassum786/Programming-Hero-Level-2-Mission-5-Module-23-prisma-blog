import { prisma } from "../lib/prisma"
import { UserRole } from "../middleware/auth"

async function seedAdmin() {
    try {
        const adminData = {
            // name: "Admin 1",
            // email: "admin2@gmail.com",
            // role: UserRole.ADMIN,
            // password: "admin1234"
 
            name: "Admin1",
            email: "admin2@admin.com",
            role: UserRole.ADMIN,
            password: "admin1234"
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if (existingUser) {
            throw new Error("User already exists!!")
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                origin:"http://localhost:3000"
            },
            body: JSON.stringify(adminData)
        })
        console.log(signUpAdmin)

    }
    catch (error) {
        console.error(error)
    }
}

seedAdmin()