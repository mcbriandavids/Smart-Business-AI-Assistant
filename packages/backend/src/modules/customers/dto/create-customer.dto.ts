import { IsString, IsEmail, IsOptional, IsPhoneNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCustomerDto {
  @ApiProperty({ description: "Customer name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Customer phone number" })
  @IsString()
  phone: string;

  @ApiProperty({ description: "Customer email address", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "Customer WhatsApp number", required: false })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ description: "Customer address", required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: "Customer preferences", required: false })
  @IsOptional()
  preferences?: any;
}

export class UpdateCustomerDto {
  @ApiProperty({ description: "Customer name", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Customer phone number", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "Customer email address", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "Customer WhatsApp number", required: false })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ description: "Customer address", required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: "Customer preferences", required: false })
  @IsOptional()
  preferences?: any;
}
