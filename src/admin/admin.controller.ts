import { Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Param, Query, Req, Res } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';
import { AdminService } from './admin.service';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { ApprovalUserDto, DeletionUserDto } from './dto';
import { IApprovalUserList, IPostList, IUserInfo, IUserList } from './interfaces';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PaginationQueryDto, SearchQueryDto } from 'src/common/dto';
import { SignInUserDto } from 'src/auth/dto';
import { Request, Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 관리자 계정 로그인
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자 계정 로그인' })
  @ApiBody({ type: SignInUserDto, description: '로그인에 필요한 정보' })
  @ApiResponse({ status: 200, description: '관리자 계정으로 로그인에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignIn(
    @Body() signInUserDto: SignInUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    await this.adminService.signInByAdmin(signInUserDto, req, res);
    return { message: '관리자 계정으로 로그인이 완료되었습니다.' };
    }

  // 관리자 회원 탈퇴 처리
  @Delete('withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴 처리' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 처리가 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async deleteUserByAdmin(@Body() deleteUserDto: DeletionUserDto): Promise<{ message: string }> {
    await this.adminService.withdrawUserByAdmin(deleteUserDto);
    return { message: '회원 탈퇴 처리가 완료되었습니다.' };
  }

    // 관리자 회원 탈퇴 취소
    @Post('withdrawal/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '회원 탈퇴 취소' })
    @ApiBody({ type: Number, description: '탈퇴 취소에 필요한 사용자 ID' })
    @ApiResponse({ status: 200, description: '회원 탈퇴 취소가 완료되었습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async postCancelWithdrawal(@Body() userId: number) {
      return this.adminService.cancelWithdrawal(userId);
    }

  // 관리자 회원 정지 처리
  @Post('suspension')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 정지 처리' })
  @ApiResponse({ status: 200, description: '회원 정지 처리가 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSuspensionByAdmin(suspensionUserDto: SuspensionUserDto): Promise<{ message: string }> {
    await this.adminService.suspendUserByAdmin(suspensionUserDto);
    return { message: '회원 정지 처리가 완료되었습니다.' };
  }

  // 관리자 회원 정지 취소
  @Post('suspension/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 정지 취소' })
  @ApiBody({ type: Number, description: '정지 취소에 필요한 사용자 ID' })
  @ApiResponse({ status: 200, description: '회원 정지 취소가 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postCancelSuspension(@Body() userId: number) {
    return this.adminService.cancelSuspension(userId);
  }

  // 관리자 전체 회원 조회
  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 회원 조회' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '회원 목록 조회 성공', type: 'IPaginatedResponse' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getAllUsers(@Query() query: PaginationQueryDto): Promise<IPaginatedResponse<IUserList>> {
    const { page, limit } = query;
    const result = await this.adminService.fetchAllUsersByAdmin(page, limit);
    return result;
  }

  // 관리자 특정 회원 정보 조회
  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 회원 정보 조회' })
  @ApiParam({ name: 'userId', type: Number, description: '회원 ID' })
  @ApiResponse({ status: 200, description: '회원 정보 조회 성공', type: 'IUserInfo' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getUserInfoByAdmin(@Param('userId') userId: number): Promise<IUserInfo> {
    return await this.adminService.fetchUserInfoByAdmin(userId);
  }

  // 관리자 회원 가입 대기자 목록 조회
  @Get('approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 가입 대기자 목록 조회' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '회원 가입 승인 목록 조회 성공', type: 'IPaginatedResponse' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getApprovalsByAdmin(@Query() query: PaginationQueryDto): Promise<IPaginatedResponse<IApprovalUserList>> {
    const { page, limit } = query;
    return await this.adminService.showUserApprovals(page, limit);
  }

  // 관리자 회원 가입 승인 및 거절 처리
  @Post('approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 가입 승인 및 거절 처리' })
  @ApiResponse({ status: 200, description: '회원 가입 승인 및 거절 처리 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postApprovalByAdmin(@Body() approvalDto: ApprovalUserDto) {
    const result = await this.adminService.processUserApproval(approvalDto);
    return result;
  }

  // 관리자 게시물 전체 조회 및 검색
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 게시물 조회 및 검색' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', type: String, required: false, description: '검색어' })
  @ApiResponse({ status: 200, description: '게시물 목록 조회 성공', type: 'IPaginatedResponse' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getAllPosts(@Query() query: SearchQueryDto): Promise<IPaginatedResponse<IPostList>> {
    const { page, limit, search } = query;
    return this.adminService.getAllPosts(page, limit, search);
  }

  // 관리자 특정 게시물 삭제
  @Delete('posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 게시물 삭제' })
  @ApiParam({ name: 'postId', type: Number, description: '게시물 ID' })
  @ApiResponse({ status: 200, description: '게시물 삭제 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async deletePost(@Param('postId') postId: number): Promise<{ message: string }> {
    await this.adminService.deletePost(postId);
    return { message: '게시물이 성공적으로 삭제되었습니다.' };
  }

  // 관리자 댓글 및 답글 전체 조회
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 댓글 및 답글 조회' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '댓글 목록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getAllComments(@Query() query: PaginationQueryDto) {
    const { page, limit } = query;
    return await this.adminService.findAllCommentsAndReplies(page, limit);
  }

  // 관리자 특정 댓글 혹은 답글 삭제
  // 댓글이나 답글 ID 넘겨주면 삭제함.
  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 댓글 또는 답글 삭제' })
  @ApiParam({ name: 'commentId', type: Number, description: '댓글 또는 답글 ID' })
  @ApiResponse({ status: 200, description: '댓글 또는 답글 삭제 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async deleteComment(@Param('commentId') commentId: number): Promise<{ message: string }> {
    await this.adminService.deleteCommentOrReplyById(commentId);
    return { message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
