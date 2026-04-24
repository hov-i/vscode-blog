"use client"

import { useTheme } from "next-themes"
import { Icon } from "@/shared/ui/icon"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={className}
      title="Toggle Theme"
    >
      <Icon name="moon" className="h-[1.2rem] w-[1.2rem] transition-all" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
