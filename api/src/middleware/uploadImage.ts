import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: 'mario-romero',
    api_key: '319438359419427',
    api_secret: 'R5kz5GWDnMr8CV94fgiPVWCjfDw'
});

// Configuración de Multer para almacenamiento temporal
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'));
        }
    }
});

// Middleware para subir múltiples imágenes
export const uploadImages = upload.array('images', 8); // máximo 8 imágenes

// Middleware para procesar y subir imágenes a Cloudinary
export const processImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next();
        }

        const uploadPromises = (req.files as Express.Multer.File[]).map(file => {
            return new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'ecommerce',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result?.secure_url || '');
                    }
                );

                uploadStream.end(file.buffer);
            });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Si es una ruta de categorías, usar solo la primera imagen
        if (req.baseUrl === '/api/categories') {
            req.body.image = uploadedUrls[0];
        } else {
            // Para productos, guardar todas las imágenes
            req.body.images = uploadedUrls;
        }

        next();
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
};