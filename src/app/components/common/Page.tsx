import {cn} from "@/lib/utils"

/** Каркас страницы: заголовок, описание, действия справа и контент. */
export function Page({
  title,
  description,
  actions,
  illustration,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Декоративная картинка/анимация справа в плашке, только на широких экранах. */
  illustration?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-4 py-6 md:px-6 md:py-8 lg:pt-3", className)}>
      <div className="from-brand/15 via-brand/5 bg-card border-border relative mb-6 overflow-hidden rounded-2xl border bg-linear-to-br to-indigo-500/10 p-5 shadow-md md:px-8 md:py-8">
        <div className="bg-brand/15 pointer-events-none absolute -top-16 -right-10 size-56 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1.5 text-base">{description}</p>}
          </div>
          {actions && <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
          {illustration && <div className="pointer-events-none -my-6 hidden shrink-0 md:block">{illustration}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

/** Белая карточка-секция. */
export function Card({className, ...props}: React.ComponentProps<"div">) {
  return <div className={cn("bg-card border-border rounded-xl border", className)} {...props} />
}

export function CardHeader({title, actions}: {title: React.ReactNode; actions?: React.ReactNode}) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-3.5">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {actions}
    </div>
  )
}
