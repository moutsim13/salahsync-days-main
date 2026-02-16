import { AnimatePresence, motion } from 'framer-motion';

interface SidebarFooterProps {
    collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
    return (
        <AnimatePresence mode="wait">
            {!collapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-auto py-4 text-center"
                >
                    {/* Beta Notice */}
                    <p className="text-xs text-muted-foreground/40">
                        Beta • Early Access
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
