// export * from './config-lang';

// export { default as useLocales } from './use-locales';

// export { default as LocalizationProvider } from './localization-provider';
export * from "./config-lang";

// Delayed Import to Break the Cycle
export { default as useLocales } from "./use-locales";

// Lazy Import to Avoid Cyclic Dependency
export { default as LocalizationProvider } from "./localization-provider";
