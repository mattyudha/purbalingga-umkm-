import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBase64: string;
    let folder = 'umkm_banyumas';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      fileBase64 = body.file;
      if (body.folder) folder = `umkm_banyumas/${body.folder}`;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    if (!fileBase64) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: folder,
    });

    return NextResponse.json({
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
