import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.CLERK_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}
