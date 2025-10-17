-- Configuración inicial

-- Eliminar tablas existentes
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS shipment_tracking;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    phone VARCHAR(20),
    address TEXT,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image VARCHAR(255),
    category_id INTEGER NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE
);

-- Tabla de órdenes
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
);

-- Tabla de items de órdenes
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE
);

-- Tabla de carrito
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Tabla de envíos
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    numero_envio VARCHAR(100) UNIQUE,
    numero_andreani VARCHAR(100),
    carrier VARCHAR(50) DEFAULT 'andreani',
    origen_codigo_postal VARCHAR(10),
    origen_direccion TEXT,
    destino_codigo_postal VARCHAR(10),
    destino_direccion TEXT,
    peso_total NUMERIC(10, 2) CHECK (peso_total > 0),
    volumen_total NUMERIC(10, 2) CHECK (volumen_total > 0),
    valor_declarado NUMERIC(10, 2) CHECK (valor_declarado >= 0),
    costo_envio NUMERIC(10, 2) CHECK (costo_envio >= 0),
    estado VARCHAR(50) DEFAULT 'pending',
    tracking_url VARCHAR(500),
    ultima_actualizacion timestamptz DEFAULT CURRENT_TIMESTAMP,
    etiqueta_url VARCHAR(500),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla de seguimiento de envíos
CREATE TABLE shipment_tracking (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL,
    estado VARCHAR(100) NOT NULL,
    descripcion TEXT,
    sucursal VARCHAR(200),
    fecha timestamptz DEFAULT CURRENT_TIMESTAMP,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_numero_envio ON shipments(numero_envio);
CREATE INDEX idx_shipments_estado ON shipments(estado);
CREATE INDEX idx_tracking_shipment ON shipment_tracking(shipment_id);

-- Comentarios sobre las tablas (los quitamos porque no son necesarios para el funcionamiento)
-- y algunos sistemas PostgreSQL pueden no soportar COMMENT ON TABLE