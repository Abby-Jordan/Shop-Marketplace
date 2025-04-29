// app/api/profile/image/route.ts

// This is the route for the profile image upload in public folder 


// import { NextRequest, NextResponse } from 'next/server';
// import { writeFile } from 'fs/promises';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get('file') as File;
//   if (!file) {
//     return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const uploadDir = path.join(process.cwd(), 'public', 'uploads');
//   await writeFile(`${uploadDir}/${file.name}`, buffer);

//   return NextResponse.json({ imageUrl: `/uploads/${file.name}` });
// }

//This is the route for the profile image upload in cloudinary
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function extractPublicId(url: string): string | null {
  try {
    const parts = url.split('/');
    if (parts.length < 2) return null;

    const folder = parts.at(-2);
    const filename = parts.at(-1)?.split('.')[0];
    if (!folder || !filename) return null;

    return `${folder}/${filename}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const oldImageUrl = req.headers.get('old-image-url'); // from frontend
  
  if (oldImageUrl) {
    const publicId = extractPublicId(oldImageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadedImage = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'profile_images' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

  const url = (uploadedImage as any).secure_url;

  return NextResponse.json({ imageUrl: url });
}



