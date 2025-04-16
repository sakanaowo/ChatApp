// This file contains the Zustand store for managing search results and loading state.
import { create } from "zustand";

// export const useSearchStore = create((set, get) => ({
//     searchResults: [],
//     isLoading: false,
//     searchTerm: "",
//     setSearchTerm: (term) => set({ searchTerm: term }),
//     setSearchResults: (results) => set({ searchResults: results }),
//     setIsLoading: (loading) => set({ isLoading: loading }),
// }));
export const useSearchStore = create((set) => ({
    searchTerm: "",
    isSearchFocused: false,
    setSearchTerm: (term) => set({ searchTerm: term }),
    setIsSearchFocused: (focused) => set({ isSearchFocused: focused }),
}));