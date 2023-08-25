import { subqlTest } from "@subql/testing";

// See https://academy.subquery.network/build/testing.html

subqlTest(
  "handleSlashed test", // Test name
  7228486, // Block height to test at
  [], // Dependent entities
  [], // Expected entities
  "handleEvent" // handler name
);
