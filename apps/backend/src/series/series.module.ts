import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesRouter } from './series.router';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [SeriesService, SeriesRouter],
  exports: [SeriesService],
})
export class SeriesModule {}
