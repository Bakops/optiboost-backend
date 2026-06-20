import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      organizationName?: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('google')
  google(@Body() body: { idToken?: string; email?: string }) {
    return this.authService.google(body);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken?: string }) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  logout(
    @Body() body: { refreshToken?: string },
    @Headers('authorization') authorization?: string,
  ) {
    return this.authService.logout(body, authorization);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    return this.authService.me(authorization);
  }
}
