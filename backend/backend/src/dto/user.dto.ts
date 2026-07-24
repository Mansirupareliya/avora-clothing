export class CreateReturnDto {
  orderId: string;
  reason: string;
}

export class CreateWishlistDto {
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export class UpdateProfileDto {
  name?: string;
  phone?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
