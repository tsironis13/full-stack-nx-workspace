import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginPostDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
