import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ProductsService } from 'src/service/products.service';
import { CreateProductDto } from 'src/dto/create-product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private async uploadToCloudinary(file: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'menswear-products',
          use_filename: true,
          unique_filename: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
    }),
  )
  async create(
    @UploadedFiles() files: any[],
    @Body() createProductDto: CreateProductDto,
  ) {
    let images: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => this.uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      images = results.map((res) => res.secure_url);
    }
    
    const imageUrl = images.length > 0 ? images[0] : undefined;

    return this.productsService.create({
      ...createProductDto,
      imageUrl,
      images: images.length > 0 ? images : undefined,
    });
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: any[],
    @Body() dto: UpdateProductDto,
  ) {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => this.uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      dto.images = results.map((res) => res.secure_url);
      dto.imageUrl = dto.images[0];
    }
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
