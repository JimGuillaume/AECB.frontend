/// <reference types="vite/client" />

declare module '@handsontable/vue3' {
	import type { DefineComponent } from 'vue';

	export const HotTable: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
}
