export class CreateCartDto {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  category?: string;
}

export class UpdateCartDto {
  quantity?: number;
  size?: string;
  color?: string;
}
