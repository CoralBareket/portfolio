import { isbot } from 'isbot';

/** Crawlers, link-preview bots and empty user agents are never counted. */
export const isBot = (ua: string) => !ua || isbot(ua);
