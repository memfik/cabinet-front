import {cn} from "@/lib/utils"

/** Каркас страницы: заголовок, описание, действия справа и контент. */
export function Page({
  title,
  description,
  actions,
  children,
  className,
  wide,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className={cn("mx-auto px-4 py-6 md:px-6 md:py-8 lg:pt-3", wide ? "max-w-8xl" : "max-w-7xl", className)}>
      <div className="bg-card border-border mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4 shadow-md md:px-6 md:py-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
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
