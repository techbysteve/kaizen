import { useQuery } from "@tanstack/react-query";
import { usersApi } from "./api";

export const userKeys = {
	all: ["users"] as const,
	list: () => [...userKeys.all, "list"] as const,
	current: () => [...userKeys.all, "current"] as const,
};

export function useUsers() {
	return useQuery({
		queryKey: userKeys.list(),
		queryFn: async () => (await usersApi.list()) ?? [],
	});
}

export function useCurrentUser() {
	return useQuery({
		queryKey: userKeys.current(),
		queryFn: async () => (await usersApi.getCurrent()) ?? null,
	});
}
