import {ClientShell} from "../components/layout/ClientShell"

/** Layout группы (main): всё внутри — только для авторизованных, доступ стережёт proxy. */
export default function MainLayout({children}: {children: React.ReactNode}) {
  return <ClientShell>{children}</ClientShell>
}
