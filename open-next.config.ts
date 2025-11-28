import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Using default filesystem cache for now
  // Can switch to R2 incremental cache if needed
});
