import React from "react";
import { AuthProvider } from "./AuthProvider";
import TrpcProvider from "./TrpcProvider";

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <TrpcProvider url={process.env.NEXT_PUBLIC_TRPC_URL!}>
      <AuthProvider>{children}</AuthProvider>
    </TrpcProvider>
  );
}
