import { createSlice } from "@reduxjs/toolkit";
export const pointSlice = createSlice({
  name: "auth",
  initialState: () => {
    return {
      point: 0,
    //   rechargePrice: 0,
    //   isRecharge: false,
    //   isShowPayment: false,
    };
  },
  reducers: {
    updatePoint(state, action) {
      state.point = action.payload.point;
    },
    // updateRecharge(state,action){
    //     state.rechargePrice=action.payload.rechargePrice
    // },
    // updateIsRecharge(state,action){
    //     state.isRecharge=action.payload.isRecharge

    // updateIsShowPayment(state,action){
    //     state.isShowPayment=action.payload.isShowPayment
    // },
  },
});

export const { updatePoint } = pointSlice.actions;
