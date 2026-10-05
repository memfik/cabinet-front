import {apiClient} from "./client"

export interface DownloadedFile {
  blob: Blob
  filename: string
}

/** Достаёт имя файла из Content-Disposition (поддерживает `filename*=UTF-8''…` для русских имён). */
function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""))
    } catch {
      /* падаем на обычный filename */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain ? plain[1].trim() : fallback
}

/**
 * Файл нужно тянуть через axios (с токеном) — обычная ссылка `<a href>` заголовок Authorization не передаст.
 * Чтобы имя файла из Content-Disposition было доступно, бэк должен отдавать его в Access-Control-Expose-Headers.
 */
export async function downloadFile(path: string, fallbackName: string): Promise<DownloadedFile> {
  const res = await apiClient.get<Blob>(path, {responseType: "blob"})
  return {blob: res.data, filename: filenameFromDisposition(res.headers["content-disposition"], fallbackName)}
}

/** Сохраняет blob на диск пользователя через временную ссылку. */
export function saveFile({blob, filename}: DownloadedFile) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
