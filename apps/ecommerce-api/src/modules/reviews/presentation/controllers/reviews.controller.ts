import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SupabaseAuthGuard } from '@full-stack-nx-workspace/auth';

import { ListProductReviewsUseCase } from '../../application/use-cases/list-product-reviews.use-case';
import { SubmitReviewUseCase } from '../../application/use-cases/submit-review.use-case';
import { EditReviewUseCase } from '../../application/use-cases/edit-review.use-case';
import { SoftDeleteReviewUseCase } from '../../application/use-cases/soft-delete-review.use-case';
import { GetMyReviewUseCase } from '../../application/use-cases/get-my-review.use-case';
import { SubmitReviewDto } from '../dto/submit-review.dto';
import { EditReviewDto } from '../dto/edit-review.dto';
import { authorProfileFromRequestUser } from '../author-profile.factory';

type AuthedRequest = { user: { id: string } & Record<string, unknown> };

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(
    private readonly listProductReviewsUseCase: ListProductReviewsUseCase,
    private readonly submitReviewUseCase: SubmitReviewUseCase,
    private readonly editReviewUseCase: EditReviewUseCase,
    private readonly softDeleteReviewUseCase: SoftDeleteReviewUseCase,
    private readonly getMyReviewUseCase: GetMyReviewUseCase,
  ) {}

  @Get()
  list(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.listProductReviewsUseCase.execute({
      productId,
      page: Math.max(1, page),
      pageSize: Math.min(50, Math.max(1, pageSize)),
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getMine(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: AuthedRequest,
  ) {
    return this.getMyReviewUseCase.execute({ productId, userId: req.user.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: SubmitReviewDto,
    @Request() req: AuthedRequest,
  ) {
    return this.submitReviewUseCase.execute({
      productId,
      userId: req.user.id,
      rating: dto.rating,
      title: dto.title ?? null,
      body: dto.body ?? null,
      profile: authorProfileFromRequestUser(req.user),
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('me')
  edit(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: EditReviewDto,
    @Request() req: AuthedRequest,
  ) {
    return this.editReviewUseCase.execute({
      productId,
      userId: req.user.id,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
      profile: authorProfileFromRequestUser(req.user),
    });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: AuthedRequest,
  ) {
    return this.softDeleteReviewUseCase.execute({
      productId,
      userId: req.user.id,
    });
  }
}
