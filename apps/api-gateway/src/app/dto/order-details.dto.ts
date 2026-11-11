import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsOptional()
  readonly productId?: string;

  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsNumber()
  @Min(1)
  readonly quantity!: number;

  @IsNumber()
  @Min(0)
  readonly price!: number;
}

export class OrderDetailsDto {
  @IsString()
  @IsNotEmpty()
  readonly orderId!: string;

  @IsString()
  @IsNotEmpty()
  readonly customerName!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  readonly items?: OrderItemDto[];
}
