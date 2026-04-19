import { auth } from "../auth"

export default async function getSessionCall() {
  const session  = await auth()
  const id = session?.user?.id
  return id;
}
