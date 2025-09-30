import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_.-]{3,32}$/i, { message: 'invalid username' })
  username?: string | null;
  @IsOptional()
  @IsString()
  @Length(0, 20, { message: 'invalid first name length' })
  firstName?: string | null;
  @IsOptional()
  @IsString()
  @Length(0, 20, { message: 'invalid second name length' })
  secondName?: string | null;
  @IsOptional()
  @IsUrl({ require_tld: true }, { message: 'invalid avatar url' })
  @Matches(/^https:\/\//i, { message: 'avatar must be https' })
  avatarUrl?: string | null;
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'invalid bio length' })
  bio?: string | null;
}
