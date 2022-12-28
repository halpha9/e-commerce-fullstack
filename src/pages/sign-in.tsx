import React, { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import type { ILogin } from "../common/validation/auth";
import { loginSchema } from "../common/validation/auth";

export default function SignIn() {
  const { handleSubmit, control, reset } = useForm<ILogin>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    async (data: ILogin) => {
      try {
        await signIn("credentials", { ...data, callbackUrl: "/dashboard" });
        reset();
      } catch (err) {
        console.error(err);
      }
    },
    [reset]
  );
  return (
    <div>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <form
          className="flex h-screen w-full items-center justify-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Welcome back!</h2>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    type="email"
                    placeholder="Type your email..."
                    className="input-bordered input w-full max-w-xs"
                    {...field}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    type="password"
                    placeholder="Type your password..."
                    className="input-bordered input my-2 w-full max-w-xs"
                    {...field}
                  />
                )}
              />
              <div className="card-actions items-center justify-between">
                <Link href="/sign-up" className="link">
                  Go to sign up
                </Link>

                <button className="btn-secondary btn" type="submit">
                  Login
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
