"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInType } from "@/lib/validation/auth-validation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GithubBtn from "./GithubBtn";
import AuthCard from "./AuthCard";
import { Spinner } from "../ui/spinner";
import { useUserActions } from "@/lib/store/user-store";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
  });
  const { hydrateFromSession } = useUserActions();

  const onSubmit = async (data: SignInType) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL:"/",
      },
      {
        onError: (error) => {
          toast.error(`Sign-in failed: ${error.error.message}`);
          console.log(error);
        },
        onSuccess: async () => {
          // Dynamically import to avoid bundling in initial load
          const { fetchSessionUser } = await import("@/lib/auth/session-utils");
          const user = await fetchSessionUser();
          
          if (user) {
            hydrateFromSession(user);
          }
          
          reset();
          toast.success("Sign-in successful!");
        },
      }
    );
  };

  const githubHandler = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: "/",
      },
      {
        onError: (error) => {
          toast.error(`GitHub sign-in failed: ${error.error.message}`);
        },
        onSuccess: () => {
          toast.success("GitHub sign-in successful!");
        },
      }
    );
  };

  const social = (
    <>
      <Field>
        <GithubBtn githubHandler={githubHandler} />
      </Field>
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-2">
        Or continue with
      </FieldSeparator>
    </>
  );

  const footer = (
    <p className="text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{" "}
      <Link href="/auth/sign-up" className="underline font-medium">
        Sign up
      </Link>
    </p>
  );

  return (
    <div className={cn("flex  flex-col gap-6", className)} {...props}>
      <AuthCard
        heading="Welcome back"
        subheading="Login with your GitHub or email account"
        social={social}
        footer={footer}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" {...register("password")} />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
            <Field>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="font-inter inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-3" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </AuthCard>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
