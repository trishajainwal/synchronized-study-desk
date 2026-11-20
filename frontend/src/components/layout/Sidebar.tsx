import {
  BarChart3,
  BookOpen,
  Library,
  ListChecks,
  MessageSquarePlus,
  Settings,
} from 'lucide-react'
import { Button } from '../common/Button'
import type { Section } from '../../types/navigation'

const navigation: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: 'workspace', label: 'Study workspace', icon: BookOpen },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'quizzes', label: 'Quizzes', icon: ListChecks },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  activeSection: Section
  onNavigate: (section: Section) => void
  onNewChat: () => void
  sessionId: string
}

export function Sidebar({ activeSection, onNavigate, onNewChat, sessionId }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-charcoal-700/70 bg-charcoal-950">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sage-600/40 bg-sage-600/10 text-sage-300">
          <BookOpen size={18} strokeWidth={1.6} />
        </div>
        <div>
          <p className="font-serif text-[15px] leading-tight text-parchment-100">
            Synchronized
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-parchment-400">Study desk</p>
        </div>
      </div>

      <div className="px-4">
        <Button variant="primary" className="w-full justify-start" onClick={onNewChat}>
          <MessageSquarePlus size={15} /> New chat
        </Button>
      </div>

      <nav className="mt-7 flex-1 space-y-1 px-3" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = activeSection === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? 'bg-charcoal-800 text-parchment-100'
                  : 'text-parchment-400 hover:bg-charcoal-900 hover:text-parchment-200'
              }`}
            >
              <Icon size={16} strokeWidth={1.7} className={active ? 'text-sage-300' : ''} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-charcoal-700/70 px-6 py-5">
        <p className="subtle-label">Session</p>
        <p className="mt-1.5 truncate font-mono text-[11px] text-parchment-400" title={sessionId}>
          {sessionId}
        </p>
      </div>
    </aside>
  )
}
