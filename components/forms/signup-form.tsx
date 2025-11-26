"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpType } from "@/lib/validation/auth-validation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import GithubBtn from "./GithubBtn";
import AuthCard from "./AuthCard";
import { Spinner } from "../ui/spinner";
import { useUserActions } from "@/lib/store/user-store";
import { useInvalidateSession } from "@/lib/hooks/useSession";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
  });
  const { hydrateFromSession } = useUserActions();
  const invalidateSession = useInvalidateSession();

  const onSubmit = async (data: SignUpType) => {

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    await authClient.signUp.email(
      {
        email: data.email,
        name: data.name,
        password: data.password,
        callbackURL: "/verify-email",
      },
      {
        onError: (error) => {
          toast.error(`Sign-up failed: ${error.error.message}`);
        },
        onSuccess: async () => {
          reset();
          toast.success(
            "Account created! Please check your email to verify your account."
          );
          window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}&message=check-email`;
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
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-1">
          Or continue with
        </FieldSeparator>
        <GithubBtn githubHandler={githubHandler} className="mt-2" />
      </Field>
    </>
  )

  const footer = (
    <p className="text-sm text-muted-foreground">
      Already have an account? {" "}
      <Link href="/auth/sign-in" className="font-semibold underline">
        Sign in
      </Link>
    </p>
  )

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {/* AuthCard encapsulates shared card layout; social is rendered after the form here */}
      <AuthCard
        heading="Create your account"
        subheading="Enter your email below to create your account"
        social={social}
        socialPosition="after"
        footer={footer}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
            <Field>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" {...register("password")} />
                  <FieldError>{errors.password?.message}</FieldError>
                </div>
                <div>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <Input id="confirm-password" type="password" {...register("confirmPassword")} />
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </div>
              </div>
              <FieldDescription>Must be at least 6 characters long.</FieldDescription>
            </Field>
            <Field>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-3" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </AuthCard>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
