import { Link, useMatch } from 'react-router'

type MenuLinkProps = {
  label: string
  to: string
  icon: React.ReactNode
}

export default function MenuLink({ label, to, icon }: MenuLinkProps) {
  const isActive = useMatch(to)
  return (
    <li>
      <Link
        className={`flex gap-2 items-center transition duration-200 py-2 px-4 rounded-lg hover:scale-105 ${isActive ? 'bg-primary shadow-lg hover:bg-primary-600/50 hover:text-neutral-300' : 'hover:bg-secondary'}`}
        aria-label={label}
        to={to}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  )
}
