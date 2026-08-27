import { redirect } from 'next/navigation';

export default async function ResumeOverviewPage({ params }) {
  const { resumeId } = await params;
  redirect(`/resume/${resumeId}`);
}
