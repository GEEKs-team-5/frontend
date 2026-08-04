import { get } from '@/shared';

export interface DrugType {
  itemSeq: string;
  name: string;
  manufacturer: string | null;
}
export interface DrugSearchResponseType {
  items: DrugType[];
}

export interface DrugInteractionItemResponseType {
  contraindicatedDrugName: string | null;
  reason: string | null;
}

export interface DrugInteractionsResponseType {
  items: DrugInteractionItemResponseType[];
}

export const getDrugSearch = (name: string) =>
  get<DrugSearchResponseType>(`api/v1/drugs/search?name=${encodeURIComponent(name)}`);
export const getDrugInteractions = (itemSeq: string) =>
  get<DrugInteractionsResponseType>(`api/v1/drugs/${itemSeq}/interactions`);
