import { ApiError } from './api';
import { fetchWithCreds, apiUrl, parseErrorResponse } from './http';

export type KnowledgeQuestionPublic = {
  id: string;
  text: string;
  options: string[];
};

export type KnowledgeSectionPublic = {
  id: string;
  title: string;
  description: string;
  questions: KnowledgeQuestionPublic[];
};

export type ApplicationKnowledgeTestState = {
  completed: boolean;
  includeEvSection: boolean;
  sections: KnowledgeSectionPublic[];
};

export async function fetchApplicationKnowledgeTest(userId: string): Promise<ApplicationKnowledgeTestState> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/application-knowledge-test`);
  const res = await fetchWithCreds(url);
  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }
  return (await res.json()) as ApplicationKnowledgeTestState;
}

export async function submitApplicationKnowledgeTest(
  userId: string,
  answers: Record<string, number>,
): Promise<ApplicationKnowledgeTestState> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/application-knowledge-test`);
  const res = await fetchWithCreds(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }
  return (await res.json()) as ApplicationKnowledgeTestState;
}
