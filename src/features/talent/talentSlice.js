import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  searchFreelancers,
  saveFreelancer,
  unsaveFreelancer,
  getPublicFreelancerProfile,
  getSavedFreelancers,
} from "../../services/talentService";

export const fetchTalents = createAsyncThunk(
  "talent/fetchTalents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await searchFreelancers(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch talents"
      );
    }
  }
);

export const fetchFreelancerDetails = createAsyncThunk(
  "talent/fetchFreelancerDetails",
  async (userIdHash, { rejectWithValue }) => {
    try {
      const data = await getPublicFreelancerProfile(userIdHash);
      return { userIdHash, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch freelancer profile"
      );
    }
  }
);

export const toggleSaveFreelancer = createAsyncThunk(
  "talent/toggleSaveFreelancer",
  async ({ freelancerId, isSaved }, { rejectWithValue }) => {
    try {
      if (isSaved) {
        await unsaveFreelancer(freelancerId);
      } else {
        await saveFreelancer(freelancerId);
      }
      return { freelancerId, isSaved: !isSaved };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle save status"
      );
    }
  }
);

export const fetchSavedTalents = createAsyncThunk(
  "talent/fetchSavedTalents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getSavedFreelancers(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch saved talents"
      );
    }
  }
);

const initialState = {
  talents: [],
  loading: false,
  error: null,
  selectedFreelancer: null,
  detailsLoading: false,
  detailsError: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  searchParams: {},
  savedTalents: [],
  savedLoading: false,
  savedError: null,
  savedPagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const talentSlice = createSlice({
  name: "talent",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload;
      state.pagination.page = 1;
    },
    clearTalents: (state) => {
      state.talents = [];
      state.error = null;
      state.pagination = initialState.pagination;
    },
    clearSelectedFreelancer: (state) => {
      state.selectedFreelancer = null;
      state.detailsError = null;
    },
    clearSavedTalents: (state) => {
      state.savedTalents = [];
      state.savedError = null;
      state.savedPagination = initialState.savedPagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTalents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTalents.fulfilled, (state, action) => {
        state.loading = false;
        const page = action.meta?.arg?.page || 1;
        const items = action.payload.items || [];
        if (page > 1) {
          state.talents = [...state.talents, ...items];
        } else {
          state.talents = items;
        }
        state.pagination = {
          page: action.payload.page || page,
          pageSize: action.payload.pageSize || 10,
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          hasNextPage: action.payload.hasNextPage || false,
          hasPreviousPage: action.payload.hasPreviousPage || false,
        };
      })
      .addCase(fetchTalents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchFreelancerDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchFreelancerDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        const { userIdHash, data } = action.payload;
        const cached = state.talents.find((t) => t.id === userIdHash);
        state.selectedFreelancer = {
          userIdHash,
          data,
          isSaved: cached?.isSaved ?? false,
        };
      })
      .addCase(fetchFreelancerDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
        state.selectedFreelancer = null;
      });

    builder
      .addCase(toggleSaveFreelancer.fulfilled, (state, action) => {
        const { freelancerId, isSaved } = action.payload;
        const talent = state.talents.find((t) => t.id === freelancerId);
        if (talent) {
          talent.isSaved = isSaved;
        }
        if (state.selectedFreelancer?.userIdHash === freelancerId) {
          state.selectedFreelancer.isSaved = isSaved;
        }
        if (!isSaved) {
          state.savedTalents = state.savedTalents.filter((t) => t.id !== freelancerId);
          if (state.savedPagination.totalCount > 0) {
            state.savedPagination.totalCount -= 1;
          }
        } else {
          const savedTalent = state.savedTalents.find((t) => t.id === freelancerId);
          if (!savedTalent) {
            const originTalent = state.talents.find((t) => t.id === freelancerId);
            if (originTalent) {
              state.savedTalents.push({ ...originTalent, isSaved: true });
              state.savedPagination.totalCount += 1;
            }
          }
        }
      })
      .addCase(toggleSaveFreelancer.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(fetchSavedTalents.pending, (state) => {
        state.savedLoading = true;
        state.savedError = null;
      })
      .addCase(fetchSavedTalents.fulfilled, (state, action) => {
        state.savedLoading = false;
        const page = action.meta?.arg?.page || 1;
        const items = action.payload.items || [];
        if (page > 1) {
          state.savedTalents = [...state.savedTalents, ...items];
        } else {
          state.savedTalents = items;
        }
        state.savedPagination = {
          page: action.payload.page || page,
          pageSize: action.payload.pageSize || 10,
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          hasNextPage: action.payload.hasNextPage || false,
          hasPreviousPage: action.payload.hasPreviousPage || false,
        };
      })
      .addCase(fetchSavedTalents.rejected, (state, action) => {
        state.savedLoading = false;
        state.savedError = action.payload;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSearchParams,
  clearTalents,
  clearSelectedFreelancer,
  clearSavedTalents,
} = talentSlice.actions;
export default talentSlice.reducer;
