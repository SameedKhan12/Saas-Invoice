"use client";

import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);

        const result = await signIn("google", {
            callbackUrl: "/",
            redirect: false,
        });

        if (result?.url) {
            window.location.href = result.url;
        }

        setLoading(false);
    };

   

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-semibold mb-4">Login</h1>
                <Button
                    className="w-full"
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                >
                    {loading ? (
                        <>
                            Signing in <Spinner />
                        </>
                    ) : (
                        "Sign in with Google"
                    )}
                </Button>
            </div>
        </div>
    );
}