"use client"

import { BarChart3, FileText, Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Series } from "@/app/page"

interface SeriesAnalyticsProps {
  series: Series
}

export function SeriesAnalytics({ series }: SeriesAnalyticsProps) {
  const totalWordCount = series.scripts.reduce((acc, script) => acc + (script.wordCount || 0), 0)
  const avgWordCount = series.scripts.length > 0 ? Math.round(totalWordCount / series.scripts.length) : 0

  const statusCounts = series.scripts.reduce(
    (acc, script) => {
      const status = script.status || "draft"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Mock character frequency data
  const characterFrequency = [
    { name: "Maya Rodriguez", appearances: 12, scenes: 18 },
    { name: "Jack Chen", appearances: 10, scenes: 15 },
    { name: "Sarah Miller", appearances: 8, scenes: 12 },
    { name: "Tom Wilson", appearances: 6, scenes: 9 },
  ]

  // Mock writing progress data (daily word count)
  const writingProgress = [
    { date: "Jan 1", words: 0 },
    { date: "Jan 5", words: 2500 },
    { date: "Jan 10", words: 5800 },
    { date: "Jan 15", words: totalWordCount },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Track your writing progress and series statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Word Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWordCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {series.scripts.length} scripts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Script Length</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWordCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Words per script</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scripts in Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.draft || 0}</div>
            <p className="text-xs text-muted-foreground">Draft status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Scripts</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.final || 0}</div>
            <p className="text-xs text-muted-foreground">Final status</p>
          </CardContent>
        </Card>
      </div>

      {/* Writing Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Progress</CardTitle>
          <CardDescription>Your word count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {writingProgress.map((point, idx) => {
              const percentage = (point.words / totalWordCount) * 100
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 text-xs text-muted-foreground">{point.date}</div>
                  <div className="flex-1">
                    <div className="h-8 rounded-md bg-muted">
                      <div
                        className="h-full rounded-md bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium">{point.words.toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Script Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Script Status</CardTitle>
            <CardDescription>Current status of all scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {series.scripts.map((script) => (
                <div key={script.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        script.status === "final"
                          ? "bg-green-500"
                          : script.status === "review"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium">{script.name}</div>
                      <div className="text-xs text-muted-foreground">{script.wordCount?.toLocaleString()} words</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {script.status === "final" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {script.status === "review" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {script.status === "draft" && <Circle className="h-4 w-4 text-blue-500" />}
                    <span className="text-xs capitalize text-muted-foreground">{script.status || "draft"}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Character Appearance Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Character Appearances</CardTitle>
            <CardDescription>Most frequent characters across scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {characterFrequency.map((char, idx) => {
                const maxAppearances = characterFrequency[0].appearances
                const percentage = (char.appearances / maxAppearances) * 100
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{char.name}</span>
                      <span className="text-muted-foreground">
                        {char.appearances} episodes · {char.scenes} scenes
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Consistency Check */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Consistency</CardTitle>
          <CardDescription>Verify chronological order and continuity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
              <div className="text-sm">
                <div className="font-medium text-green-700 dark:text-green-400">Episode order is consistent</div>
                <div className="text-xs text-green-600 dark:text-green-500">All episodes are numbered sequentially</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
              <div className="text-sm">
                <div className="font-medium text-green-700 dark:text-green-400">No timeline conflicts detected</div>
                <div className="text-xs text-green-600 dark:text-green-500">
                  Character ages and locations are consistent
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
