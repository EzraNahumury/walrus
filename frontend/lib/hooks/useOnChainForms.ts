"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  fetchOnChainForms,
  fetchOnChainResponses,
  isOnChainEnabled,
  stubResponseFromEvent,
  stubSchemaFromEvent,
  type OnChainForm,
  type OnChainResponse,
} from "@/lib/sui-query";
import type { FormResponse, FormSchema } from "@/types/signalvault";

const EMPTY_FORMS: OnChainForm[] = [];
const EMPTY_RESPONSES: OnChainResponse[] = [];

export interface UseOnChainFormsResult {
  enabled: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  forms: FormSchema[];
  raw: OnChainForm[];
  refetch: () => void;
}

export function useOnChainForms(): UseOnChainFormsResult {
  const enabled = isOnChainEnabled();
  const q = useQuery({
    queryKey: ["onchain-forms"],
    queryFn: fetchOnChainForms,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const raw = q.data ?? EMPTY_FORMS;
  // Memoize so consumers' useEffect deps stay stable across renders.
  const forms = useMemo<FormSchema[]>(
    () => raw.map((f) => f.schema ?? stubSchemaFromEvent(f)),
    [raw],
  );

  return {
    enabled,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    forms,
    raw,
    refetch: () => q.refetch(),
  };
}

export interface UseOnChainResponsesResult {
  enabled: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  responses: FormResponse[];
  raw: OnChainResponse[];
  refetch: () => void;
}

export function useOnChainResponses(
  policyId: string | undefined,
  formId: string | undefined,
): UseOnChainResponsesResult {
  const enabled = isOnChainEnabled() && Boolean(policyId);
  const q = useQuery({
    queryKey: ["onchain-responses", policyId],
    queryFn: () => fetchOnChainResponses(policyId!),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const raw = q.data ?? EMPTY_RESPONSES;
  const responses = useMemo<FormResponse[]>(
    () => raw.map((e) => e.response ?? stubResponseFromEvent(e, formId ?? "unknown")),
    [raw, formId],
  );

  return {
    enabled,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    responses,
    raw,
    refetch: () => q.refetch(),
  };
}
