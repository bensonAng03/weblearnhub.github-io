import { createSlice } from "@reduxjs/toolkit";
export const pointSlice = createSlice({
  name: "auth",
  initialState: () => {
    return {
      point: 0,
    };
  },
  reducers: {
    updatePoint(state, action) {
      state.point = action.payload.point;
    },
  },
});

export const { updatePoint } = pointSlice.actions;
