import { auth } from "../auth"

export default async function getSessionCall<String>() {
  const session  = await auth()
  const id = session?.user?.id
  return id;
}
