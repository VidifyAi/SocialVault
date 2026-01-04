import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwksClient from 'jwks-rsa';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private jwksClient: jwksClient.JwksClient;

  constructor(private jwtService: JwtService) {
    const clerkDomain = process.env.CLERK_DOMAIN || 'clerk.example.com';
    this.jwksClient = jwksClient({
      jwksUri: `https://${clerkDomain}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = await this.verifyToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyToken(token: string): Promise<any> {
    const decoded = this.jwtService.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new UnauthorizedException('Invalid token structure');
    }

    const key = await this.jwksClient.getSigningKey(decoded.header.kid);
    const signingKey = key.getPublicKey();

    return this.jwtService.verify(token, {
      publicKey: signingKey,
      algorithms: ['RS256'],
    });
  }
}
