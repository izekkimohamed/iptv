import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [CommonService],
  exports: [CommonService], // <- make it available to other modules
})
export class CommonModule {}
