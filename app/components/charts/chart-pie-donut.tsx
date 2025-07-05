"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

export const description = "A donut chart"

interface ChartPieDonutProps {
  data: Array<{
    [key: string]: string | number
  }>
  config: ChartConfig
  title?: string
  description?: string
  dataKey: string
  nameKey: string
  innerRadius?: number
  showTrending?: boolean
  trendingText?: string
  footerText?: string
  className?: string
}

export function ChartPieDonut({
  data,
  config,
  title = "Pie Chart - Donut",
  description = "Chart data visualization",
  dataKey,
  nameKey,
  innerRadius = 60,
  showTrending = true,
  trendingText = "Trending up by 5.2% this month",
  footerText = "Showing total data for the selected period",
  className = "",
}: ChartPieDonutProps) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {showTrending && (
          <div className="flex items-center gap-2 leading-none font-medium">
            {trendingText} <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          {footerText}
        </div>
      </CardFooter>
    </Card>
  )
}