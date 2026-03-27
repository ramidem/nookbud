import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { InternalApiKeyGuard } from './email.controller';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService, InternalApiKeyGuard],
  exports: [EmailService],
})
export class EmailModule {}
