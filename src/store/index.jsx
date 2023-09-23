import {configureStore} from "@reduxjs/toolkit"
import {setupListeners} from "@reduxjs/toolkit/query"
import { authSlice } from "./reducer/authSlice";
import { pointSlice } from "./reducer/pointSlice";
const store =configureStore({
    reducer:{
        auth:authSlice.reducer,
        point:pointSlice.reducer
    }
})
setupListeners(store.dispatch)
export default store;
