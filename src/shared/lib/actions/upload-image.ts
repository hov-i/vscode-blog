"use server";

import { createClient } from "@/shared/lib/supabase/server";

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" };
    }

    // 이미지 파일 타입 확인
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" };
    }

    const supabase = await createClient();

    // 고유한 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from("blog-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from("blog-uploads")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
