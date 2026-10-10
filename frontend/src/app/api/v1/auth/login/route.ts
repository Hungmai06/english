import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Vui lòng nhập đầy đủ email và mật khẩu',
          },
        },
        { status: 400 }
      );
    }

    // Standard demo / user authentication mock
    const user = {
      id: 'usr-1001',
      email,
      displayName: email.includes('admin') ? 'Quản Trị Viên' : 'English Learner',
      role: email.includes('admin') ? 'ADMIN' : 'STUDENT',
      streakDays: 5,
      totalXP: 1420,
      level: 4,
    };

    return NextResponse.json({
      success: true,
      data: {
        token: 'jwt-mock-access-token-lingua-core-2026',
        user,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Lỗi máy chủ khi đăng nhập',
        },
      },
      { status: 500 }
    );
  }
}
