// Declaration for .sql file imports (used by drizzle migrations)
declare module '*.sql' {
  const content: string;
  export default content;
}
