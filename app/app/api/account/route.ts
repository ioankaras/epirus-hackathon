import { account } from "@/lib/mock-data";

export async function GET() {
  return Response.json(account);
}
