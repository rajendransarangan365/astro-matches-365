import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: 'dh9vdxaqv',
    api_key: '638581591567468',
    api_secret: 'LB-dHP8PvX-JWEZYxrwBW-WWf_M'
});

export default cloudinary;
