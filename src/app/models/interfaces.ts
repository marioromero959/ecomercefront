export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'customer' | 'admin';
    phone?: string;
    address?: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    description?: string;
    image?: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    categoryId: number;
    featured: boolean;
    Category?: Category;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface CartItem {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    Product: Product;
  }
  
  export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    Product: Product;
  }
  
  export interface Order {
    id: number;
    userId: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: string;
    OrderItems: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AuthResponse {
    message: string;
    token: string;
    user: User;
  }
  
  export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
  }