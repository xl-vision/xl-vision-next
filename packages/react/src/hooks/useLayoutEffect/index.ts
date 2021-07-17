import { useEffect, useLayoutEffect } from 'react';
import { env } from '@xl-vision/utils';

// 修复在ssr中的警告
export default env.isBrowser ? useLayoutEffect : useEffect;
