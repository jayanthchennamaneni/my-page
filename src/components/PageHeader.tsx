interface PageHeaderProps {
  path: string
  title: string
  description: string
}

export default function PageHeader({ path, title, description }: PageHeaderProps) {
  return (
    <header className="matrix-page-header">
      <div className="container">
        <p className="terminal-path">~/Jayanthchennamaneni/{path}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
    </header>
  )
}
