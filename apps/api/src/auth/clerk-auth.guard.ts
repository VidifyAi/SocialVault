import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwksClient from 'jwks-rsa';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private jwksClient: any;

  constructor(private configService: ConfigService) {
    const clerkJwksUrl = this.configService.get<string>('CLERK_JWKS_URL');
    if (!clerkJwksUrl) {
      throw new Error('CLERK_JWKS_URL is not configured');
    }

    this.jwksClient = jwksClient({
      jwksUri: clerkJwksUrl,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Verify the JWT token using JWKS
      const decoded = await this.verifyToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async verifyToken(token: string): Promise<any> {
    // In production, this would use jose or jsonwebtoken to verify the token
    // For now, we're providing the structure for JWKS verification
    // This is a placeholder that would be replaced with actual JWT verification
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return decoded;
  }

  private async getSigningKey(kid: string): Promise<string> {
    const key = await this.jwksClient.getSigningKey(kid);
    return key.getPublicKey();
  }
}
