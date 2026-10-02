import {NextResponse} from "next/server"
import type {NextRequest} from "next/server"

/** Публичные маршруты: вход и восстановление пароля. Всё остальное требует токена. */
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"]

/**
 * Защита маршрутов на уровне edge: без cookie auth_token уводим на /login.
 * Это только «привратник» от случайных переходов — реальную авторизацию проверяет
 * бэк по Bearer-токену.
 */
export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    // запоминаем, куда пользователь шёл — после входа вернём его именно туда
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

/** Не трогаем статику и картинки — иначе на каждый ассет уходил бы редирект. */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)"],
}
