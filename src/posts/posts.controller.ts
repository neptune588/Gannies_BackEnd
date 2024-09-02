import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BoardType } from './enum/boardType.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/interfaces/session-decorator.interface';
import { SignInGuard } from '../auth/guards';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  //게시글 전체 및 검색 조회
  @Get(':boardType')
  @HttpCode(200)
  async getPosts(
    @Param('boardType') boardType: BoardType,
    @Query()
    paginateQueryDto: PaginateQueryDto,
  ) {
    try {
      const result = await this.postsService.getPosts(boardType, paginateQueryDto);

      return result;
    } catch (err) {
      throw err;
    }
  }
  //특정 게시글 조회
  @Get(':boardType/:id')
  @HttpCode(200)
  async getPostDetails(@Param('boardType') boardType: BoardType, @Param('id') id: number) {
    try {
      const result = await this.postsService.getPostDetails(boardType, id);

      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 생성
  @Post(':boardType')
  @HttpCode(201)
  @UseGuards(SignInGuard)
  async createPost(
    @Param('boardType') boardType: BoardType,
    @Body() createPostDto: CreatePostDto,
    @SessionUser() sessionUser: User,
  ) {
    try {
      const result = await this.postsService.createPost(boardType, createPostDto, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }
  //게시글 수정
  @Patch(':boardType/:postId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async updatePost(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @SessionUser() sessionUser: User,
  ) {
    try {
      const result = await this.postsService.updatePost(boardType, postId, updatePostDto, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
    //나중에 userId 추가
  }
  //게시글 삭제
  @Delete(':boardType/:postId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async softDeletePost(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @SessionUser() sessionUser: User,
  ) {
    //나중에 userId 추가
    try {
      const result = await this.postsService.deletePost(boardType, postId, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }
}
