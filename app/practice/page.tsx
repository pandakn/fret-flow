import { Navbar } from "@/components/layout/Navbar"
import { PracticeHome } from "@/components/practice/PracticeHome"

export default function PracticePage() {
  return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><PracticeHome /></main></div>
}
