import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';
import { ChannelsService } from './channels.service';
import { ChannelsRouter } from './channels.router';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [ChannelsService, ChannelsRouter],
  exports: [ChannelsService],
})
export class ChannelsModule {}
