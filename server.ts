import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { join, extname } from "https://deno.land/std@0.204.0/path/mod.ts";

const PORT = 8000;
const PUBLIC_DIR = './dist'; // 你的 build 資料夾位置

// MIME 類型映射
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

// 靜態文件處理
async function handleRequest(req: Request) {
  const url = new URL(req.url);
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  let filePath = join(PUBLIC_DIR, pathname);

  try {
    // 檢查文件是否存在
    const fileInfo = await Deno.stat(filePath);
    
    // 處理目錄
    if (fileInfo.isDirectory) {
      filePath = join(filePath, "index.html");
    }
    
    // 使用更可靠的方式讀取文件
    const fileContent = await Deno.readFile(filePath);
    
    // 確定內容類型
    const extension = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    
    return new Response(fileContent, {
      status: 200,
      headers: { "Content-Type": contentType }
    });
    
  } catch (error) {
    // 如果文件不存在，嘗試返回 index.html（用於 SPA 路由）
    if (error instanceof Deno.errors.NotFound) {
      try {
        const content = await Deno.readFile(join(PUBLIC_DIR, "index.html"));
        
        return new Response(content, {
          status: 200,
          headers: { "Content-Type": "text/html" }
        });
      } catch {
        return new Response("找不到文件", { status: 404 });
      }
    }
    
    return new Response(`服務器錯誤: ${error.message}`, { status: 500 });
  }
}

console.log(`服務器運行於 http://localhost:${PORT}`);

serve(handleRequest, { addr: `:${PORT}` });
