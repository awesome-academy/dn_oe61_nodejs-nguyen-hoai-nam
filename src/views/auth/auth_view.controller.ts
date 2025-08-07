import { Controller, Get, Render } from '@nestjs/common';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('auth')
export class AuthViewController {
    @Public()
    @Get('login')
    @Render('login')
    async loginPage() {
        return {
            title: 'Login - Training System',
            description: 'Sign in to your account'
        };
    }

    @Public()
    @Get('confirm_account')
    @Render('confirm-account')
    async confirmAccountPage() {
        return {
            title: 'Account Confirmation',
            description: 'Confirm your account'
        };
    }
}

@ApiExcludeController()
@Controller('admin/dashboard')
export class DashboardViewController {
    @Public()
    @Get('')
    @Render('dashboard')
    async dashboardPage() {
        return {
            title: 'Dashboard - Training System',
            description: 'Welcome to your dashboard'
        };
    }
}
