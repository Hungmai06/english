import { redirect } from 'next/navigation';

interface TopicPageProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const resolvedParams = await params;
  const { topicId } = resolvedParams;
  redirect(`/learn/grammar?topic=${topicId}`);
}
