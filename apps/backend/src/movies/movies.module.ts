import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesRouter } from './movies.router';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [MoviesService, MoviesRouter],
  exports: [MoviesService],
})
export class MoviesModule {}
