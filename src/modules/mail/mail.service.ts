// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const createMail = async (subject: string, message: string) => {
//   try {
//     //  Replace this with your DB (Prisma)
//     const users = [
//       { email: "tabassum.anika579@gmail.com" },
//     ];

//     const emails = users.map((user) => user.email);

//     //  send emails (batch or loop)
//     const results = [];

//     for (const email of emails) {
//       const response = await resend.emails.send({
//         from: "Admin <onboarding@resend.dev>",
//         to: email,
//         subject,
//         html: `<p>${message}</p>`,
//       });

//       results.push(response);
//     }

//     return results;
//   } catch (error) {
//     throw error;
//   }
// };

// export const mailService = {
//   createMail,
// };




import nodemailer from "nodemailer";

const createMail = async (subject: string, message: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
      },
    });

    const users = [
      { email: "tabassum.anika579@gmail.com" }, // test email
    ];

    const results = [];

    for (const user of users) {
      const info = await transporter.sendMail({
        from: `"CareConnect" <${process.env.APP_USER}>`,
        to: user.email,
        subject,
        html: `<p>${message}</p>`,
      });

      results.push(info);
    }

    return results;
  } catch (error) {
    console.log("Email error:", error);
    throw error;
  }
};

export const mailService = {
  createMail,
};