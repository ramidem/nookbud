import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { EmailService } from './email.service';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);
    const expected = this.config.getOrThrow<string>('INTERNAL_API_KEY');

    return token === expected;
  }
}

interface InviteBody {
  to: string;
  inviterName: string;
  spaceTitle: string;
  inviteCode: string;
}

interface ExportReadyBody {
  to: string;
  userName: string;
  exportType: string;
  attachmentUrl?: string;
}

@Controller('email')
@UseGuards(InternalApiKeyGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('invite')
  @HttpCode(HttpStatus.OK)
  async sendInvite(@Body() body: InviteBody): Promise<{ sent: boolean }> {
    await this.emailService.sendInvite(
      body.to,
      body.inviterName,
      body.spaceTitle,
      body.inviteCode,
    );
    return { sent: true };
  }

  @Post('export-ready')
  @HttpCode(HttpStatus.OK)
  async sendExportReady(
    @Body() body: ExportReadyBody,
  ): Promise<{ sent: boolean }> {
    await this.emailService.sendExport(
      body.to,
      body.userName,
      body.exportType,
      body.attachmentUrl,
    );
    return { sent: true };
  }
}
