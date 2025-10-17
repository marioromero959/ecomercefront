import { User, Category, Product } from '../models';
import { sequelize } from '../config/database';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Limpiar tablas existentes
    console.log('🧹 Limpiando tablas existentes...');
    await Product.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('✅ Tablas limpiadas');

    // Crear categorías
    const categories = await Category.bulkCreate([
      {
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y tecnología',
        image: 'https://via.placeholder.com/300x200?text=Electrónicos'
      },
      {
        name: 'Ropa',
        description: 'Vestimenta para todas las edades',
        image: 'https://via.placeholder.com/300x200?text=Ropa'
      },
      {
        name: 'Hogar',
        description: 'Artículos para el hogar y decoración',
        image: 'https://via.placeholder.com/300x200?text=Hogar'
      },
      {
        name: 'Deportes',
        description: 'Artículos deportivos y fitness',
        image: 'https://via.placeholder.com/300x200?text=Deportes'
      }
    ]);

    console.log('✅ Categorías creadas:', categories.length);

    // Crear productos
    const products = await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro',
        description: 'El último iPhone con tecnología avanzada',
        price: 1299.99,
        stock: 50,
        image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
        featured: true,
        categoryId: (categories[0] as any).id
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Smartphone Android de última generación',
        price: 999.99,
        stock: 30,
        image: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
        featured: true,
        categoryId: (categories[0] as any).id
      },
      {
        name: 'Camiseta Nike',
        description: 'Camiseta deportiva de alta calidad',
        price: 29.99,
        stock: 100,
        image: 'https://via.placeholder.com/300x300?text=Camiseta+Nike',
        featured: false,
        categoryId: (categories[1] as any).id
      },
      {
        name: 'Zapatillas Adidas',
        description: 'Zapatillas deportivas cómodas',
        price: 89.99,
        stock: 75,
        image: 'https://via.placeholder.com/300x300?text=Zapatillas+Adidas',
        featured: true,
        categoryId: (categories[1] as any).id
      },
      {
        name: 'Sofá Moderno',
        description: 'Sofá elegante para tu sala',
        price: 599.99,
        stock: 10,
        image: 'https://via.placeholder.com/300x300?text=Sofá+Moderno',
        featured: false,
        categoryId: (categories[2] as any).id
      },
      {
        name: 'Pelota de Fútbol',
        description: 'Pelota oficial de fútbol',
        price: 24.99,
        stock: 50,
        image: 'https://via.placeholder.com/300x300?text=Pelota+Fútbol',
        featured: false,
        categoryId: (categories[3] as any).id
      }
    ]);

    console.log('✅ Productos creados:', products.length);

    // Crear usuario admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890',
      address: 'Dirección del administrador'
    });

    console.log('✅ Usuario admin creado:', (admin as any).email);

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Datos creados:`);
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${products.length} productos`);
    console.log(`   - 1 usuario admin`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
