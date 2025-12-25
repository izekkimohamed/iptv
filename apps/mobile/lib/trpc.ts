import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
// Import the type from your existing router.ts file
import type { AppRouter } from "../../api/lib/router";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_TRPC_URL}`,
    }),
  ],
});
