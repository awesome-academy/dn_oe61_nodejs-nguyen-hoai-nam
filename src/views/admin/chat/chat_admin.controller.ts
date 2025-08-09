import { Controller, Get, Param, Render, UseGuards } from '@nestjs/common';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';

@Controller('admin/chat')
export class ChatAdminController {
  @Public()
  @Get('')
  @Render('chat')
  async viewTemplate() {
    return {
      title: 'Chat System',
      description: 'Real-time messaging for courses',
    };
  }
}
