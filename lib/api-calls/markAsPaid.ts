
export async function markAsPaid(id: string) {
    try {
        const res = await fetch(`/api/invoices/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },        
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error marking invoice as paid:", error);
        throw new Error("Failed to mark invoice as paid");
    }
}