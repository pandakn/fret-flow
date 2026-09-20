import { Navbar } from "@/components/layout/Navbar"
import { ProgressDashboard } from "@/components/progress/ProgressDashboard"

export default function ProgressPage() {
  return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><ProgressDashboard /></main></div>
}
