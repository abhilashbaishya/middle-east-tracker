import { NewsDashboard } from "@/components/news-dashboard";
import { getNews } from "@/lib/news";

export default async function Home() {
  const initialPayload = await getNews();

  return <NewsDashboard initialPayload={initialPayload} />;
}
