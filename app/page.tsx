import ConnectPage from "@/components/ConnectPage";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawSource = resolvedParams?.source;
  const source = typeof rawSource === "string" && rawSource.trim() ? rawSource.trim() : "direct";

  return <ConnectPage source={source} />;
}
