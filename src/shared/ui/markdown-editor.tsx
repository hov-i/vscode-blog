"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Icon } from "./icon";
import { MarkdownRenderer } from "./markdown-renderer";
import { uploadImage } from "@/shared/lib/actions/upload-image";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "# Start writing...",
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadImage(formData);
      
      if (result.success && result.url) {
        // 커서 위치에 마크다운 이미지 문법 삽입
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const imageMarkdown = `![${file.name}](${result.url})`;
          const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
          onChange(newValue);
          
          // 커서를 삽입된 텍스트 뒤로 이동
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
          }, 0);
        }
      } else {
        alert(result.error || "이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] mb-2">
        <div className="flex">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "edit"
                ? "border-[var(--accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon name="edit" className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-[var(--accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon name="eye" className="w-4 h-4 inline mr-1" />
            Preview
          </button>
        </div>
        
        {/* 이미지 업로드 버튼 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 flex items-center gap-1"
        >
          {isUploading ? (
            <>
              <Icon name="loading" className="w-3 h-3 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Icon name="image" className="w-3 h-3" />
              Upload Image
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "edit" ? (
          <div
            className={`h-full relative ${isDragging ? "ring-2 ring-[var(--accent)]" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              className="w-full h-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-4 text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)] font-mono leading-relaxed"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {isDragging && (
              <div className="absolute inset-0 bg-[var(--accent)] bg-opacity-10 flex items-center justify-center pointer-events-none">
                <div className="text-[var(--accent)] text-lg font-medium">
                  Drop image here
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-4">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-[var(--text-secondary)] text-sm">
                Nothing to preview
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
