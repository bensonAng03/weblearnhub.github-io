import {configureStore} from "@reduxjs/toolkit"
import {setupListeners} from "@reduxjs/toolkit/query"
import { authSlice } from "./reducer/authSlice";
import { pointSlice } from "./reducer/pointSlice";
const store =configureStore({
    reducer:{
        // [authApi.reducerPath]:authApi.reducer,
        // [courseApi.reducerPath]:courseApi.reducer,
        // [topicApi.reducerPath]:topicApi.reducer,
        // [assignmentApi.reducerPath]:assignmentApi.reducer,
        // [assestApi.reducerPath]:assestApi.reducer,
        auth:authSlice.reducer,
        point:pointSlice.reducer
    },
    middleware:(getDefaultMiddleware)=>
    getDefaultMiddleware().concat(
        // authApi.middleware,
        // courseApi.middleware,
        // topicApi.middleware,
        // assignmentApi.middleware,
        // assestApi.middleware
        )
})
setupListeners(store.dispatch)
export default store;
