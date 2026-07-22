import js from "@eslint/js";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
				Log: "readonly",
				Module: "readonly",
				config: "readonly",
				moment: "readonly",
				TEAM_LOGO_MAPPINGS: "readonly",
				EUROPEAN_LEAGUES: "readonly"
			}
		},
		rules: {
			"no-redeclare": "off",
			"no-undef": "error"
		}
	}
];
