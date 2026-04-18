import type { CheerioAPI } from 'cheerio';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type CheckResult = {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  passed: boolean;
};

export type PageContext = {
  content: string;
  $: CheerioAPI;
  url: URL;
};

export type CheckFn = (page: PageContext) => CheckResult | Promise<CheckResult>;
