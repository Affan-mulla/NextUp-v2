"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Title from "./Title"

type Props = {
  heading?: string
  subheading?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  social?: React.ReactNode
  socialPosition?: "before" | "after"
  className?: string
}

export default function AuthCard({
  heading,
  subheading,
  children,
  footer,
  social,
  socialPosition = "before",
  className,
}: Props) {
  return (
    <div className={className}>
      <Card className="bg-card text-card-foreground border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>
            <Title />
          </CardTitle>
          {heading ? <CardTitle className="text-xl font-outfit">{heading}</CardTitle> : null}
          {subheading ? <CardDescription >{subheading}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {social && socialPosition === "before" ? social : null}
          {children}
          {social && socialPosition === "after" ? social : null}
        </CardContent>
        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </Card>
    </div>
  )
}
