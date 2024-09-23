import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addDoc, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { avatarGenerator } from '../../utils/avatarGenerator';

const initialState = {
    currentUser: JSON.parse(sessionStorage.getItem('user')) || null,
    loading: false,
    error: null,
    friends: [],
};

export const getUserFriends = createAsyncThunk(
    'user/friends',
    async (_, { getState, rejectWithValue }) => {

        try {
            const { currentUser } = getState().user;

            const querySnapshot = await getDocs(collection(db, 'users'));
            const allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const friends = allUsers.filter(user => user.id !== currentUser?.id);

            return friends;

        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);

        }
    }
)

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            sessionStorage.removeItem('user');
            return;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (values, { rejectWithValue }) => {
        const { email, password } = values;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = { id: userCredential.user.uid, ...userDoc.data() };
                sessionStorage.setItem('user', JSON.stringify(userData));
                return userData;
            } else {
                return rejectWithValue('User does not exist');
            }
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);
        }
    }
);

export const createUser = createAsyncThunk(
    'user/createUser',
    async (values, { rejectWithValue }) => {
        const { username, email, password } = values;
        const avatar = avatarGenerator(email);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                avatar,
                email,
                id: res.user.uid,
                blocked: []
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            const userData = { uid: res.user.uid, username, email };
            sessionStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);
        }
    }
);

export const getUserData = createAsyncThunk(
    'user/getUserData',
    async (uid, { rejectWithValue }) => {
        if (!uid) {
            return rejectWithValue('User ID is required');
        }

        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = { id: uid, ...userDoc.data() };
                sessionStorage.setItem('user', JSON.stringify(userData));
                return userData;
            } else {
                return rejectWithValue('User does not exist');
            }
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },

    extraReducers: (builder) => {
        builder
            .addCase(getUserFriends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserFriends.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.friends = payload;
            })
            .addCase(getUserFriends.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.currentUser = null;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.currentUser = payload;
            })
            .addCase(loginUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.currentUser = payload;
            })
            .addCase(createUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(getUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserData.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.currentUser = payload;
            })
            .addCase(getUserData.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            });
    },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
