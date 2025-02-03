"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

// Combine timeline and distribution data
const vestingData = {
	vestingTimeline: [
		{ name: "Jan", tokens: 0, locked: 4000, released: 0, pending: 0 },
		{ name: "Feb", tokens: 0, locked: 4000, released: 0, pending: 400 },
		{ name: "Mar", tokens: 1000, locked: 3000, released: 1000, pending: 400 },
		{ name: "Apr", tokens: 2000, locked: 2000, released: 2000, pending: 400 },
		{ name: "May", tokens: 3000, locked: 1000, released: 3000, pending: 400 },
		{ name: "Jun", tokens: 4000, locked: 0, released: 4000, pending: 0 },
	],
};
// const chartConfig = {
// 	desktop: {
// 		label: "Desktop",
// 		color: "hsl(var(--chart-1))",
// 	},
// 	mobile: {
// 		label: "Mobile",
// 		color: "hsl(var(--chart-2))",
// 	},
// 	other: {
// 		label: "Other",
// 		color: "hsl(var(--chart-3))",
// 	},
// } satisfies ChartConfig;

const chartConfig = {
	tokens: {
		label: "Tokens",
		color: "hsl(var(--chart-2))",
	},
	locked: {
		label: "Locked",
		color: "hsl(var(--chart-1))",
	},
	released: {
		label: "Released",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;
export function TokenVestingChart() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Area Chart - Stacked Expanded</CardTitle>
				<CardDescription>
					Showing total visitors for the last 6months
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={vestingData.vestingTimeline}
						margin={{
							left: 12,
							right: 12,
							top: 12,
						}}
						stackOffset='expand'>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='name'
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator='line' />}
						/>
						<Area
							dataKey='tokens'
							type='natural'
							fill='var(--color-tokens)'
							fillOpacity={0.1}
							stroke='var(--color-tokens)'
							stackId='a'
						/>
						<Area
							dataKey='locked'
							type='natural'
							fill='var(--color-locked)'
							fillOpacity={0.4}
							stroke='var(--color-locked)'
							stackId='a'
						/>
						<Area
							dataKey='released'
							type='natural'
							fill='var(--color-released)'
							fillOpacity={0.4}
							stroke='var(--color-released)'
							stackId='a'
						/>
						<ChartLegend content={<ChartLegendContent />} />
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className='flex w-full items-start gap-2 text-sm'>
					<div className='grid gap-2'>
						<div className='flex items-center gap-2 font-medium leading-none'>
							Trending up by 5.2% this month{" "}
							<TrendingUp className='h-4 w-4' />
						</div>
						<div className='flex items-center gap-2 leading-none text-muted-foreground'>
							January - June 2024
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
