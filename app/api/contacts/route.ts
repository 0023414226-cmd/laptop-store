import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional().nullable(),
  subject: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  message: z.string().min(10, "Nội dung tin nhắn phải có ít nhất 10 ký tự"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    const contact = await db.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Gửi thông tin liên hệ thành công!", contact },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi thông tin liên hệ." },
      { status: 500 }
    );
  }
}
