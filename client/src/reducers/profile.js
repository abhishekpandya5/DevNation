import {
	GET_PROFILE,
	UPDATE_PROFILE,
	PROFILE_ERROR,
	CLEAR_PROFILE,
	GET_PROFILES,
	GET_REPOS
} from '../actions/types';

const initialState = {
	profile: null,
	profiles: [],
	repos: [],
	loading: true,
	error: {}
};

/* eslint import/no-anonymous-default-export: */
export default function (state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_PROFILE:
		case UPDATE_PROFILE:
			return {
				...state,
				profile: payload,
				loading: false
			};

		case GET_PROFILES:
			return {
				...state,
				profiles: payload,
				loading: false
			};

		case PROFILE_ERROR:
			return {
				...state,
				error: payload,
				loading: false
			};

		case CLEAR_PROFILE:
			return {
				...state,
				profile: null,
				repos: [],
				loading: false
			};

		case GET_REPOS:
			return {
				...state,
				repos: payload,
				loading: false
			};

		default:
			return state;
	}
}
