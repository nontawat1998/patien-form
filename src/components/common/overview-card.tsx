import React, { type ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";

export type OverviewCardProps = {
  title: string;
  content: string;

  children?: React.ReactNode;

  badge?: React.ReactNode;
  badgeVariant?: ComponentProps<typeof Badge>["variant"];
};

export function OverviewCard(props: OverviewCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{props.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {props.content}
        </CardTitle>
        <CardAction>
          {props.badge && (
            <Badge variant={props.badgeVariant ?? "outline"}>
              {props.badge}
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {props.children}
      </CardFooter>
    </Card>
  );
}

