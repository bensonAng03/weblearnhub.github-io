import {configureStore} from "@reduxjs/toolkit"
import {setupListeners} from "@reduxjs/toolkit/query"
// import { authApi } from "./api/authApi";
// import { courseApi } from "./api/courseApi";
import { authSlice } from "./reducer/authSlice";
// import {topicApi} from "./api/topicApi";
// import {assignmentApi} from "./api/assignmentApi";
// import {assestApi} from "./api/assestApi";
const store =configureStore({
    reducer:{
        // [authApi.reducerPath]:authApi.reducer,
        // [courseApi.reducerPath]:courseApi.reducer,
        // [topicApi.reducerPath]:topicApi.reducer,
        // [assignmentApi.reducerPath]:assignmentApi.reducer,
        // [assestApi.reducerPath]:assestApi.reducer,
        auth:authSlice.reducer
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
