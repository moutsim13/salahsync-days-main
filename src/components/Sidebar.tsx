import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CalendarDays,
  LayoutGrid,
  Repeat,
  BarChart3,
  Settings,
  Inbox,
  Tag,
  CheckCircle2,
  Trash2,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { SidebarFooter } from '@/components/SidebarFooter';
import { Logo } from '@/components/Logo';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { icon: Calendar, label: 'Today', path: '/today' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
  { icon: LayoutGrid, label: 'Prayer Board', path: '/board' },
  { icon: Repeat, label: 'Deeds', path: '/deeds' },
  { icon: BarChart3, label: 'Statistics', path: '/stats' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { lists, tags } = useStore();
  const [listsOpen, setListsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Logo showText={false} />
              <span className="font-semibold text-sidebar-foreground">Waqt</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2A9D8F]/90 text-white opacity-90">
                Beta
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon size={18} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Separator */}
        {!collapsed && <div className="my-4 border-t border-sidebar-border" />}

        {/* Lists Section */}
        {!collapsed && (
          <div className="space-y-1">
            <button
              onClick={() => setListsOpen(!listsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="uppercase tracking-wider">Lists</span>
              <ChevronDown
                size={14}
                className={cn('transition-transform', listsOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {listsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {lists.map((list) => (
                    <NavLink
                      key={list.id}
                      to={`/list/${list.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    >
                      <Inbox size={16} style={{ color: list.color }} />
                      <span>{list.name}</span>
                    </NavLink>
                  ))}
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                    <Plus size={16} />
                    <span>Add list</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tags Section */}
        {!collapsed && (
          <div className="space-y-1 mt-2">
            <button
              onClick={() => setTagsOpen(!tagsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="uppercase tracking-wider">Tags</span>
              <ChevronDown
                size={14}
                className={cn('transition-transform', tagsOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {tagsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {tags.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No tags yet</p>
                  ) : (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      >
                        <Tag size={16} style={{ color: tag.color }} />
                        <span>{tag.name}</span>
                      </button>
                    ))
                  )}
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                    <Plus size={16} />
                    <span>Add tag</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Separator */}
        {!collapsed && <div className="my-4 border-t border-sidebar-border" />}

        {/* Bottom Items */}
        {!collapsed && (
          <>
            <NavLink
              to="/completed"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/completed'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <CheckCircle2 size={18} />
              <span>Completed</span>
            </NavLink>
            <NavLink
              to="/trash"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/trash'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Trash2 size={18} />
              <span>Trash</span>
            </NavLink>
          </>
        )}

        {/* Sidebar Footer with Quran Verse */}
        <SidebarFooter collapsed={collapsed} />
      </nav>
    </motion.aside>
  );
}
