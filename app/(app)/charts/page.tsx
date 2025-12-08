import { fetchNetworkMetrics } from "@/lib/xandeum"
import { MetricCharts } from "@/components/dashboard/metric-charts"
import { AnimatedHeader, MotionDiv } from "@/components/motion-div"
import { Activity } from "lucide-react"

export default async function ChartsPage() {
    const metrics = await fetchNetworkMetrics();

    return (
        <div className="space-y-6 page-container pb-10">
            <AnimatedHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Performance</h1>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <p className="text-zinc-500 text-xs sm:text-sm">Real-time network analytics</p>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-emerald-400">Live</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/50 border border-white/10 self-start sm:self-auto">
                        <Activity className="h-4 w-4 text-orange-400" />
                        <span className="text-xs sm:text-sm text-zinc-400">Epoch</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">{metrics.epoch}</span>
                    </div>
                </div>
            </AnimatedHeader>

            <MotionDiv delay={0.1}>
                <MetricCharts metrics={metrics} />
            </MotionDiv>
        </div>
    )
}
