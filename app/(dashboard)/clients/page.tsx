"use client";

// This page is for managing clients. It allows you to view, add, and delete clients.
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
import { Edit2Icon, Search, SearchIcon, Trash } from "lucide-react";

import { clientSchema } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ClientsLoading from "./ClientsLoading";

export default function CLientsPage() {
  const [fetching, setFetching] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function fetchClients() {
    try {
      setFetching(true);
      const response = await fetch("/api/client", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setClients(data);
      setFetching(false);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setFetching(false);
    }
  }

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    const result = clientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (editingId) {
      // Update existing client
      try {
        const updateResponse = await fetch(`/api/client/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
        const updatedClient = await updateResponse.json();
        setClients(
          clients.map((client) =>
            client.id === editingId ? updatedClient : client,
          ),
        );
        setEditingId(null);
      } catch (error) {
        console.error("Error updating client:", error);
      }
    } else {
      // Add new client
      try {
        const response = await fetch("/api/client", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
        const newClient = await response.json();
        console.log(newClient);
        setClients([...clients, newClient]);
        setForm({ name: "", email: "" });
      } catch (error) {
        console.error("Error adding client:", error);
      }
    }
    setForm({ name: "", email: "" });
    fetchClients();
  }

  useEffect(() => {
    fetchClients();
  }, []);

  function deleteClient(id: string) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/client/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          setClients(clients.filter((client) => client.id !== id));
          return;
        }
        throw new Error(result.error);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    });
  }

  const filteredClients = clients.filter(
    (clients) =>
      clients.name.toLowerCase().includes(search.toLocaleLowerCase()) ||
      clients.email.toLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="flex w-full gap-12 lg:gap-0.5 justify-between flex-col lg:flex-row px-4">
      <div className="space-y-6 w-full">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Field className="max-w-lg">
          <FieldLabel>Search</FieldLabel>
          <InputGroup>
            <InputGroupInput
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className=""
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        {/* Add new client form */}
        <Card className="max-w-lg shadow">
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <form onSubmit={addClient} className="">
            <CardContent className="mb-3">
              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && (
                    <FieldDescription className="text-destructive">
                      {errors.name}
                    </FieldDescription>
                  )}
                </Field>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <FieldDescription className="text-destructive">
                      {errors.email}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit">
                {editingId ? "Update Client" : "Add Client"}
              </Button>
              {editingId && (
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", email: "" });
                  }}
                  className="text-sm text-gray-500"
                >
                  Cancel
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Client list */}
      <div className="space-y-2 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {fetching ? (
            <>
              <ClientsLoading />
              <ClientsLoading />
              <ClientsLoading />
            </>
          ) : filteredClients.length === 0 ? (
            <TableCaption>
              {search
                ? "No matching clients found 🔍"
                : "No clients yet. Add your first client 🚀"}
            </TableCaption>
          ) : (
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => {
                        setEditingId(client.id);
                        setForm({
                          name: client.name,
                          email: client.email,
                        });
                      }}
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isPending}
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}


