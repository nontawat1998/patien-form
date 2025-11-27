import React from "react";
import { useNumberFormat } from "@/hooks/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { OverviewCard } from "@/components/common/overview-card";

export type PerformanceCardProps = {
  title: string;
  value: number;

  percentage?: number;
  children?: React.ReactNode;

  format?: Intl.NumberFormatOptions;
};

export function PerformanceCard(props: PerformanceCardProps) {
  const formatter = useNumberFormat(
    ["en-US"],
    props.format ?? {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  );

  const percentageFormatter = useNumberFormat(["en-US"], {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <OverviewCard
      title={props.title}
      content={formatter.format(props.value)}
      badge={
        !props.percentage ? null : (
          <>
            {props.percentage < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
            <span>
              {props.percentage < 0 ? "-" : "+"}
              {percentageFormatter.format(Math.abs(props.percentage))}
            </span>
          </>
        )
      }
      children={props.children}
    />
  );
}
