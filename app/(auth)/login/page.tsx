"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldGroup
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = schema.safeParse(form);
        if (!result.success) {
            const fieldErrors: any = {};
            result.error.issues.forEach(issue => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setError(fieldErrors);
            return;
        }
        setError({});
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(form),
            })

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
            } else {
                throw new Error(data.message);
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/");
        }
        catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-black">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-semibold mb-4">Login</h1>
                {/* Email */}
                <FieldGroup>
                    <Field data-invalid={!!error.email}>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            data-invalid={!!error.email}
                        />
                        {error.email && (
                            <FieldDescription>{error.email}</FieldDescription>
                        )}
                    </Field>
                    {/* Password */}
                    <Field data-invalid={!!error.password}>
                        <FieldLabel>Password</FieldLabel>

                        <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            data-invalid={!!error.password}
                        />
                        {error.password && (
                            <FieldDescription>{error.password}</FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <Button className="w-full" disabled={loading} type="submit">
                            {loading ? <>Logging in <Spinner /></> : "Login"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}