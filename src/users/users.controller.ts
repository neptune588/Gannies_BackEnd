import { Controller, Get, Patch, Body, Query, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionUser } from 'src/auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { GetMyCommentsQueryDto, GetMyPostsQueryDto, UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard, SignInGuard } from 'src/auth/guards';

@ApiTags('Users')
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 본인 정보 조회
  @UseGuards(SignInGuard)
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '본인 정보 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '본인의 정보가 성공적으로 조회되었습니다.', 
    schema: {
      example: {
        nickname: 'exampleNickname',
        email: 'example@example.com',
        username: 'exampleUser',
        phoneNumber: '010-1234-5678',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패', 
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  async getMyInfo(@SessionUser() user: IUserWithoutPassword) {
    return this.usersService.fetchMyInfo(user);
  }

  // 본인 닉네임 수정
  @UseGuards(SignInGuard)
  @Patch('nickname')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 닉네임 수정' })
  @ApiBody({
    type: UpdateNicknameDto,
    description: '수정할 닉네임 정보',
    examples: {
      'application/json': {
        value: { newNickname: '맥모닝불여일견' },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: '닉네임이 성공적으로 수정되었습니다.',
    schema: {
      example: { message: '닉네임이 수정되었습니다.' },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  async patchMyInfo(@SessionUser() user: IUserWithoutPassword, @Body() updateNicknameDto: UpdateNicknameDto) {
    return this.usersService.updateMyNickname(user, updateNicknameDto);
  }

  // 본인 비밀번호 수정
  @UseGuards(SignInGuard)
  @Patch('password')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 비밀번호 수정' })
  @ApiBody({
    type: UpdatePasswordDto,
    description: '수정할 비밀번호 정보',
    examples: {
      'application/json': {
        value: {
          oldPassword: 'OldPassword1!',
          newPassword: 'NewPassword1!',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: '비밀번호가 성공적으로 수정되었습니다.',
    schema: {
      example: { message: '비밀번호가 수정되었습니다.' },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  @ApiResponse({ status: 403, description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '수정 권한이 없습니다.',
      },
    },
  })
  async patchMyPassword(@SessionUser() user: IUserWithoutPassword, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updateMyPassword(user, updatePasswordDto);
  }

  // 본인 게시글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('posts')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 게시글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 게시글 수', required: false, example: 10 })
  @ApiQuery({ name: 'sort', type: String, enum: ['latest', 'popular'], description: '정렬 기준', required: false, example: 'latest' })
  @ApiResponse({ 
    status: 200, 
    description: '본인의 게시글이 성공적으로 조회되었습니다.',
    schema: {
      example: [
        { postId: 1, title: 'Example Post', content: 'This is an example post content.', createdAt: '2024-09-01T12:00:00Z' },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  async getMyPosts(@SessionUser() user: IUserWithoutPassword, @Query() query: GetMyPostsQueryDto) {
    return this.usersService.fetchMyPosts(user, query.page, query.limit, query.sort);
  }

  // 본인 댓글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('comments')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 댓글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 댓글 수', required: false, example: 10 })
  @ApiQuery({ name: 'sort', type: String, enum: ['latest', 'popular'], description: '정렬 기준', required: false, example: 'latest' })
  @ApiResponse({ 
    status: 200, 
    description: '본인의 댓글이 성공적으로 조회되었습니다.',
    schema: {
      example: [
        { commentId: 1, postId: 1, content: '이건 샘플 댓글이다.', createdAt: '2024-09-01T12:00:00Z' },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  async getMyComments(@SessionUser() user: IUserWithoutPassword, @Query() query: GetMyCommentsQueryDto) {
    return this.usersService.fetchMyComments(user, query.page, query.limit, query.sort);
  }

  // 인증서류 이미지에서 실명 추출
  @Post('/:userId/name-extraction')
  @HttpCode(200)
  @ApiOperation({ summary: '인증서류 이미지에서 실명 추출' })
  @ApiResponse({ 
    status: 200, 
    description: '실명 추출 및 회원 정보 업데이트 성공',
    schema: {
      example: {
        message: '실명 추출 및 회원 정보 업데이트 성공',
        userName: '김개똥',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  @ApiResponse({ status: 404, description: '회원 또는 인증서류를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '회원 또는 인증서류를 찾을 수 없습니다.',
      },
    },
  })
  async postNameExtraction(@Param('userId') userId: number): Promise<{ message: string; userName: string }> {
    const userName = await this.usersService.extractUserName(userId);
    return { message: '실명 추출 및 회원 정보 업데이트 성공', userName };
  }
}
