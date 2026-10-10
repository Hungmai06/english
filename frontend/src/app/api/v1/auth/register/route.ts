import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Vui lòng nhập đầy đủ thông tin đăng ký',
          },
        },
        { status: 400 }
      );
    }

    const user = {
      id: `usr-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role: 'STUDENT',
      streakDays: 1,
      totalXP: 50,
      level: 1,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          token: 'jwt-mock-access-token-lingua-core-2026',
          user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Lỗi máy chủ khi đăng ký tài khoản',
        },
      },
      { status: 500 }
    );
  }
}
