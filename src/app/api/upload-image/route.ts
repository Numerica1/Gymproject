import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function uploadToSupabaseStorage(file: string, bucket: string): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase is not configured");
  }

  // Convert base64 to blob
  const base64Data = file.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  // Detect original image type from base64 header
  const imageType = file.match(/^data:(image\/[a-zA-Z]+);base64/)?.[1] || 'image/jpeg';
  
  const blob = new Blob(byteArrays, { type: imageType });
  
  // Generate unique filename with original extension
  const extension = imageType === 'image/png' ? 'png' : 
                    imageType === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
  
  // Upload to Supabase Storage
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': imageType,
    },
    body: blob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to Supabase Storage: ${errorText}`);
  }

  // Get public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
  return publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as string;
    const bucket = formData.get("bucket") as string || "gym-images";

    if (!file) {
      return jsonError("No file provided", 400);
    }

    // Validate it's a base64 image
    if (!file.startsWith('data:image/')) {
      return jsonError("Invalid image format", 400);
    }

    // Try to upload to Supabase Storage
    try {
      const url = await uploadToSupabaseStorage(file, bucket);
      return NextResponse.json({ url });
    } catch (storageError) {
      // If storage upload fails, return error to let client fallback to compression
      console.error("Storage upload failed:", storageError);
      return jsonError("Storage upload failed", 500);
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Upload failed", 500);
  }
}
